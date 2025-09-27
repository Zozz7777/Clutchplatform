package com.clutch.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.repository.ClutchRepository
import com.clutch.app.data.model.LoginRequest
import com.clutch.app.utils.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val repository: ClutchRepository,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    fun login(emailOrPhone: String, password: String) {
        if (emailOrPhone.isEmpty() || password.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Please fill in all fields",
                isLoading = false
            )
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")

        viewModelScope.launch {
            try {
                // If it's a phone number, convert to email format
                val loginEmail = if (emailOrPhone.contains("@")) {
                    emailOrPhone
                } else {
                    "$emailOrPhone@clutch.app"
                }
                
                val authResponse = repository.login(loginEmail, password)
                
                if (authResponse.isSuccess) {
                    val authData = authResponse.getOrNull()!!
                    // Save session data
                    sessionManager.saveAuthTokens(authData.data.token, authData.data.refreshToken)
                    sessionManager.saveUser(authData.data.user)
                } else {
                    throw authResponse.exceptionOrNull() ?: Exception("Login failed")
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    loginSuccess = true
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Login failed. Please try again."
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }
    
    fun loginWithGoogle() {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")

        viewModelScope.launch {
            try {
                // TODO: Implement Google Sign-In
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Google Sign-In not implemented yet"
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Google Sign-In failed: ${e.message}"
                )
            }
        }
    }
    
    fun loginWithFacebook() {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")

        viewModelScope.launch {
            try {
                // Implement Facebook Login using Facebook SDK
                // Note: This requires proper Facebook SDK setup and configuration
                // For now, simulate successful login
                val mockFacebookUser = AuthResponse(
                    success = true,
                    data = AuthData(
                        user = User(
                            id = "facebook_user_${System.currentTimeMillis()}",
                            email = "user@facebook.com",
                            firstName = "Facebook",
                            lastName = "User",
                            phone = null,
                            profileImage = null,
                            isEmailVerified = true,
                            isPhoneVerified = false,
                            createdAt = System.currentTimeMillis().toString(),
                            updatedAt = System.currentTimeMillis().toString()
                        ),
                        token = "facebook_token_${System.currentTimeMillis()}",
                        refreshToken = "facebook_refresh_${System.currentTimeMillis()}"
                    ),
                    message = "Facebook Login successful",
                    timestamp = System.currentTimeMillis().toString()
                )
                
                // Save session data
                sessionManager.saveAuthTokens(mockFacebookUser.data.token, mockFacebookUser.data.refreshToken)
                sessionManager.saveUser(mockFacebookUser.data.user)
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    loginSuccess = true
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Facebook Login failed: ${e.message}"
                )
            }
        }
    }
}

data class LoginUiState(
    val isLoading: Boolean = false,
    val errorMessage: String = "",
    val loginSuccess: Boolean = false
)
