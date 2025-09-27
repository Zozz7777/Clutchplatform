package com.clutch.app.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.ImeAction
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.components.ErrorDialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.platform.LocalContext
import com.clutch.app.utils.TranslationManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignupScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToLogin: () -> Unit = {},
    onSignupSuccess: () -> Unit = {},
    viewModel: SignupViewModel = hiltViewModel()
  ) {
      val context = LocalContext.current
      var name by remember { mutableStateOf("") }
      var email by remember { mutableStateOf("") }
      var mobileNumber by remember { mutableStateOf("") }
      var password by remember { mutableStateOf("") }
      var confirmPassword by remember { mutableStateOf("") }
      var passwordVisible by remember { mutableStateOf(false) }
      var confirmPasswordVisible by remember { mutableStateOf(false) }
      var agreeToTerms by remember { mutableStateOf(false) }
      var showErrorDialog by remember { mutableStateOf(false) }
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Handle signup success
    LaunchedEffect(uiState.signupSuccess) {
        if (uiState.signupSuccess) {
            onSignupSuccess()
        }
    }
    
    // Handle error messages
    LaunchedEffect(uiState.errorMessage) {
        if (uiState.errorMessage.isNotEmpty()) {
            showErrorDialog = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.create_your_account),
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
                        modifier = Modifier
                            .size(40.dp)
                            .padding(end = 8.dp)
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

              // Name Input
              OutlinedTextField(
                  value = name,
                  onValueChange = { name = it },
                  label = { Text("Name") },
                  keyboardOptions = KeyboardOptions(
                      keyboardType = KeyboardType.Text,
                      imeAction = ImeAction.Next
                  ),
                  modifier = Modifier.fillMaxWidth(),
                  colors = OutlinedTextFieldDefaults.colors(
                      focusedBorderColor = ClutchRed,
                      unfocusedBorderColor = Color.LightGray,
                      focusedLabelColor = ClutchRed,
                      unfocusedLabelColor = Color.LightGray,
                      focusedTextColor = Color.Black,
                      unfocusedTextColor = Color.LightGray,
                      focusedLeadingIconColor = ClutchRed,
                      unfocusedLeadingIconColor = Color.LightGray,
                      focusedTrailingIconColor = ClutchRed,
                      unfocusedTrailingIconColor = Color.LightGray
                  )
              )

              Spacer(modifier = Modifier.height(16.dp))

              // Email Input
              OutlinedTextField(
                  value = email,
                  onValueChange = { email = it },
                  label = { Text("Email") },
                  keyboardOptions = KeyboardOptions(
                      keyboardType = KeyboardType.Email,
                      imeAction = ImeAction.Next
                  ),
                  modifier = Modifier.fillMaxWidth(),
                  colors = OutlinedTextFieldDefaults.colors(
                      focusedBorderColor = ClutchRed,
                      unfocusedBorderColor = Color.LightGray,
                      focusedLabelColor = ClutchRed,
                      unfocusedLabelColor = Color.LightGray,
                      focusedTextColor = Color.Black,
                      unfocusedTextColor = Color.LightGray,
                      focusedLeadingIconColor = ClutchRed,
                      unfocusedLeadingIconColor = Color.LightGray,
                      focusedTrailingIconColor = ClutchRed,
                      unfocusedTrailingIconColor = Color.LightGray
                  )
              )

              Spacer(modifier = Modifier.height(16.dp))

            // Mobile Number Input
            OutlinedTextField(
                value = mobileNumber,
                onValueChange = { mobileNumber = it },
                label = { Text("Mobile Number") },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Phone,
                    imeAction = ImeAction.Next
                ),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    focusedLabelColor = ClutchRed,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.LightGray,
                    focusedLeadingIconColor = ClutchRed,
                    unfocusedLeadingIconColor = Color.LightGray,
                    focusedTrailingIconColor = ClutchRed,
                    unfocusedTrailingIconColor = Color.LightGray
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Password Input
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Next
                ),
                trailingIcon = {
                    val image = if (passwordVisible)
                        Icons.Filled.Visibility
                    else Icons.Filled.VisibilityOff

                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(imageVector = image, contentDescription = "Toggle password visibility")
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    focusedLabelColor = ClutchRed,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.LightGray,
                    focusedLeadingIconColor = ClutchRed,
                    unfocusedLeadingIconColor = Color.LightGray,
                    focusedTrailingIconColor = ClutchRed,
                    unfocusedTrailingIconColor = Color.LightGray
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Confirm Password Input
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = { Text("Confirm Password") },
                visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                trailingIcon = {
                    val image = if (confirmPasswordVisible)
                        Icons.Filled.Visibility
                    else Icons.Filled.VisibilityOff

                    IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                        Icon(imageVector = image, contentDescription = "Toggle confirm password visibility")
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    focusedLabelColor = ClutchRed,
                    unfocusedLabelColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.LightGray,
                    focusedLeadingIconColor = ClutchRed,
                    unfocusedLeadingIconColor = Color.LightGray,
                    focusedTrailingIconColor = ClutchRed,
                    unfocusedTrailingIconColor = Color.LightGray
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Terms Agreement
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = agreeToTerms,
                    onCheckedChange = { agreeToTerms = it },
                    colors = CheckboxDefaults.colors(
                        checkedColor = ClutchRed,
                        uncheckedColor = Color.LightGray,
                        checkmarkColor = Color.White
                    )
                )
                Text(
                    text = TranslationManager.getString(context, R.string.agree_to_terms),
                    color = Color.Black,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(32.dp))


              // Sign Up Button
              Button(
                  onClick = {
                      viewModel.signup(name, email, mobileNumber, password, confirmPassword, agreeToTerms)
                  },
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
                    Text("SIGN UP", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Social Signup
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = TranslationManager.getString(context, R.string.or_signup_with),
                    color = Color.Gray,
                    fontSize = 14.sp
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Google Signup
                    OutlinedButton(
                        onClick = { 
                            viewModel.signupWithGoogle()
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.Black
                        )
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_google_logo),
                            contentDescription = "Google",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Google", fontSize = 14.sp)
                    }

                    // Facebook Signup
                    OutlinedButton(
                        onClick = { 
                            viewModel.signupWithFacebook()
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.Black
                        )
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_facebook_logo),
                            contentDescription = "Facebook",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Facebook", fontSize = 14.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Already have account
            TextButton(onClick = onNavigateToLogin) {
                Text("Already have an account?", color = ClutchRed)
            }
        }
    }
    
    // Error Dialog
    if (showErrorDialog && uiState.errorMessage.isNotEmpty()) {
        val isUserExistsError = uiState.errorMessage.contains("already registered", ignoreCase = true)
        
        ErrorDialog(
            title = if (isUserExistsError) "Email Already Registered" else "Signup Failed",
            message = uiState.errorMessage,
            onDismiss = { 
                showErrorDialog = false
                viewModel.clearError()
            },
            onRetry = if (isUserExistsError) {
                {
                    showErrorDialog = false
                    viewModel.clearError()
                    onNavigateToLogin()
                }
            } else {
                {
                    viewModel.signup(name, email, mobileNumber, password, confirmPassword, agreeToTerms)
                }
            },
            retryButtonText = if (isUserExistsError) "Go to Login" else "Try Again"
        )
    }
}

@Preview(showBackground = true)
@Composable
fun SignupScreenPreview() {
    ClutchAppTheme {
        SignupScreen()
    }
}
