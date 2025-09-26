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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToLogin: () -> Unit = {},
    onResetPassword: () -> Unit = {}
) {
    var emailOrPhone by remember { mutableStateOf("") }
    var isEmailSent by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Forgot Password",
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

            if (!isEmailSent) {
                // Reset Password Form
                Text(
                    text = "Enter your email or phone number to receive a reset code",
                    color = Color.Black,
                    fontSize = 16.sp,
                    modifier = Modifier.padding(bottom = 32.dp)
                )

                // Email/Phone Input
                OutlinedTextField(
                    value = emailOrPhone,
                    onValueChange = { emailOrPhone = it },
                    label = { Text("Email or Phone Number") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ClutchRed,
                        unfocusedBorderColor = Color.Gray,
                        focusedLabelColor = ClutchRed,
                        unfocusedLabelColor = Color.Gray,
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black
                    )
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Send Reset Code Button
                Button(
                    onClick = { isEmailSent = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("SEND RESET CODE", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
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
                        text = "Reset code sent!",
                        color = Color.Black,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "We've sent a reset code to $emailOrPhone. Please check your email or SMS and enter the code below.",
                        color = Color.Gray,
                        fontSize = 16.sp,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Reset Code Input
                    OutlinedTextField(
                        value = "", // TODO: Add state for reset code
                        onValueChange = { /* TODO */ },
                        label = { Text("Enter Reset Code") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray,
                            focusedLabelColor = ClutchRed,
                            unfocusedLabelColor = Color.Gray
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // New Password Input
                    OutlinedTextField(
                        value = "", // TODO: Add state for new password
                        onValueChange = { /* TODO */ },
                        label = { Text("New Password") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray,
                            focusedLabelColor = ClutchRed,
                            unfocusedLabelColor = Color.Gray
                        )
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Reset Password Button
                    Button(
                        onClick = onResetPassword,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("RESET PASSWORD", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Resend Code
                    TextButton(onClick = { /* TODO: Resend code */ }) {
                        Text("Didn't receive the code? Resend", color = ClutchRed)
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Back to Login
            TextButton(onClick = onNavigateToLogin) {
                Text("Back to Login", color = ClutchRed)
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ForgotPasswordScreenPreview() {
    ClutchAppTheme {
        ForgotPasswordScreen()
    }
}
