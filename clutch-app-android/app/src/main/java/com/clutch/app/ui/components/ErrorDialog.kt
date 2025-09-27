package com.clutch.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.theme.ErrorRed
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import com.clutch.app.utils.TranslationManager
import com.clutch.app.R

@Composable
fun ErrorDialog(
    title: String = "Error",
    message: String,
    onDismiss: () -> Unit,
    onRetry: (() -> Unit)? = null,
    retryButtonText: String = "Retry"
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    ) {
        CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Error Icon
                Icon(
                    imageVector = Icons.Default.Error,
                    contentDescription = TranslationManager.getString(context, R.string.error),
                    modifier = Modifier.size(48.dp),
                    tint = ErrorRed
                )
                
                // Title
                Text(
                    text = title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black,
                    textAlign = TextAlign.Center
                )
                
                // Message
                Text(
                    text = message,
                    fontSize = 16.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp
                )
                
                // Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (onRetry != null) {
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.Gray
                            )
                        ) {
                            Text(TranslationManager.getString(context, R.string.cancel), fontSize = 14.sp)
                        }
                        
                        Button(
                            onClick = {
                                onRetry()
                                onDismiss()
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                        ) {
                            Text(retryButtonText, fontSize = 14.sp, color = Color.White)
                        }
                    } else {
                        Button(
                            onClick = onDismiss,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                        ) {
                            Text(TranslationManager.getString(context, R.string.ok), fontSize = 14.sp, color = Color.White)
                        }
                    }
                }
            }
        }
        }
    }
}
