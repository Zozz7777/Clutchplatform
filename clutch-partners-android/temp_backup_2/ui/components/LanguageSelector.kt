package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.ui.theme.AppLanguage
import com.clutch.partners.ui.theme.LocalLanguageManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanguageSelector(
    modifier: Modifier = Modifier,
    onLanguageChanged: (AppLanguage) -> Unit = {}
) {
    val languageManager = LocalLanguageManager.current
    var showLanguageDialog by remember { mutableStateOf(false) }
    
    Row(
        modifier = modifier
            .selectable(
                selected = false,
                onClick = { showLanguageDialog = true }
            )
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Default.Language,
            contentDescription = "Language",
            tint = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = languageManager.currentLanguage.displayName,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
    
    if (showLanguageDialog) {
        LanguageSelectionDialog(
            currentLanguage = languageManager.currentLanguage,
            onLanguageSelected = { language ->
                languageManager.setLanguage(language)
                onLanguageChanged(language)
                showLanguageDialog = false
            },
            onDismiss = { showLanguageDialog = false }
        )
    }
}

@Composable
fun LanguageSelectionDialog(
    currentLanguage: AppLanguage,
    onLanguageSelected: (AppLanguage) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Select Language",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                AppLanguage.values().forEach { language ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = currentLanguage == language,
                                onClick = { onLanguageSelected(language) }
                            )
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentLanguage == language,
                            onClick = { onLanguageSelected(language) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = language.displayName,
                            fontSize = 16.sp,
                            fontWeight = if (currentLanguage == language) FontWeight.SemiBold else FontWeight.Normal
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
fun LanguageToggleButton(
    modifier: Modifier = Modifier,
    onLanguageChanged: (AppLanguage) -> Unit = {}
) {
    val languageManager = LocalLanguageManager.current
    val isRTL = languageManager.isRTL()
    
    IconButton(
        onClick = {
            val newLanguage = if (isRTL) AppLanguage.ENGLISH else AppLanguage.ARABIC
            languageManager.setLanguage(newLanguage)
            onLanguageChanged(newLanguage)
        },
        modifier = modifier
    ) {
        Text(
            text = if (isRTL) "EN" else "ع",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
    }
}
