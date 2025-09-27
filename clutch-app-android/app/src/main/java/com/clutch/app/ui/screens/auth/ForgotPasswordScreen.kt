package com.clutch.app.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clutch.app.ui.components.ErrorDialog
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToLogin: () -> Unit = {},
    onResetPassword: () -> Unit = {},
    viewModel: ForgotPasswordViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var emailOrPhone by remember { mutableStateOf("") }
    var resetCode by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var showErrorDialog by remember { mutableStateOf(false) }
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Handle password reset success
    LaunchedEffect(uiState.isPasswordReset) {
        if (uiState.isPasswordReset) {
            onResetPassword()
        }
    }
    
    // Handle error dialog
    LaunchedEffect(uiState.errorMessage) {
        if (uiState.errorMessage.isNotEmpty()) {
            showErrorDialog = true
        }
    }

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = TranslationManager.getString(context, R.string.forgot_password_title),
                            color = ClutchRed,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = ClutchRed)
                        }
                    },
                    actions = {
                        Image(
                            painter = painterResource(id = R.drawable.clutch_logo_red),
                            contentDescription = "Clutch Logo",
                            modifier = Modifier.size(40.dp)
                        )
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.White
                    )
                )
            }
        ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color.White)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            if (!uiState.isEmailSent) {
                // Reset Password Form
                Text(
                    text = TranslationManager.getString(context, R.string.forgot_password_description),
                    color = Color.Black,
                    fontSize = 16.sp,
                    modifier = Modifier.padding(bottom = 32.dp)
                )

                // Email/Phone Input
                OutlinedTextField(
                    value = emailOrPhone,
                    onValueChange = { emailOrPhone = it },
                    label = { Text(TranslationManager.getString(context, R.string.email_or_phone_number)) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ClutchRed,
                        unfocusedBorderColor = Color.LightGray,
                        focusedLabelColor = ClutchRed,
                        unfocusedLabelColor = Color.LightGray,
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black
                    )
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Send Reset Code Button
                Button(
                    onClick = { viewModel.sendResetCode(emailOrPhone) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(12.dp),
                    enabled = !uiState.isLoading
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    } else {
                        Text(TranslationManager.getString(context, R.string.send_reset_code), color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                // Email Sent Confirmation
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Email,
                        contentDescription = "Email Sent",
                        tint = ClutchRed,
                        modifier = Modifier.size(64.dp)
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = TranslationManager.getString(context, R.string.reset_code_sent),
                        color = Color.Black,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = TranslationManager.getString(context, R.string.reset_code_description).format(uiState.emailOrPhone),
                        color = Color.Gray,
                        fontSize = 16.sp,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Reset Code Input
                    OutlinedTextField(
                        value = resetCode,
                        onValueChange = { resetCode = it },
                        label = { Text(TranslationManager.getString(context, R.string.enter_reset_code)) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.LightGray,
                            focusedLabelColor = ClutchRed,
                            unfocusedLabelColor = Color.LightGray,
                            focusedTextColor = Color.Black,
                            unfocusedTextColor = Color.LightGray
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // New Password Input
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text(TranslationManager.getString(context, R.string.new_password)) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.LightGray,
                            focusedLabelColor = ClutchRed,
                            unfocusedLabelColor = Color.LightGray,
                            focusedTextColor = Color.Black,
                            unfocusedTextColor = Color.LightGray
                        )
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Reset Password Button
                    Button(
                        onClick = { viewModel.resetPassword(uiState.emailOrPhone, resetCode, newPassword) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(12.dp),
                        enabled = !uiState.isLoading
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        } else {
                            Text(TranslationManager.getString(context, R.string.reset_password), color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Resend Code
                    TextButton(onClick = { /* TODO: Resend code */ }) {
                        Text(TranslationManager.getString(context, R.string.didnt_receive_code), color = ClutchRed)
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Back to Login
            TextButton(onClick = onNavigateToLogin) {
                Text(TranslationManager.getString(context, R.string.back_to_login), color = ClutchRed)
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
        }
    }
    
    // Error Dialog
    if (showErrorDialog && uiState.errorMessage.isNotEmpty()) {
        ErrorDialog(
            title = "Error",
            message = uiState.errorMessage,
            onDismiss = { 
                showErrorDialog = false
                viewModel.clearError()
            },
            onRetry = {
                showErrorDialog = false
                viewModel.clearError()
            }
        )
    }
}

@Preview(showBackground = true)
@Composable
fun ForgotPasswordScreenPreview() {
    ClutchAppTheme {
        ForgotPasswordScreen()
    }
}
