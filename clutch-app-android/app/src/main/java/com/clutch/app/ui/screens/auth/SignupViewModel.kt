package com.clutch.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.repository.ClutchRepository
import com.clutch.app.data.model.RegisterRequest
import com.clutch.app.utils.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SignupViewModel @Inject constructor(
    private val repository: ClutchRepository,
    private val sessionManager: SessionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(SignupUiState())
    val uiState: StateFlow<SignupUiState> = _uiState

    fun signup(name: String, email: String, mobileNumber: String, password: String, confirmPassword: String, agreeToTerms: Boolean) {
        if (name.isEmpty() || email.isEmpty() || mobileNumber.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Please fill in all fields",
                isLoading = false
            )
            return
        }

        if (password != confirmPassword) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Passwords do not match",
                isLoading = false
            )
            return
        }

        if (!agreeToTerms) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Please agree to terms and conditions",
                isLoading = false
            )
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")

        viewModelScope.launch {
            try {
                val firstName = name.split(" ").firstOrNull() ?: name
                val lastName = name.split(" ").drop(1).joinToString(" ")
                
                val registerResult = repository.register(
                    email = email, // Use actual email
                    phone = mobileNumber,
                    firstName = firstName,
                    lastName = lastName,
                    password = password,
                    confirmPassword = confirmPassword,
                    agreeToTerms = agreeToTerms
                )
                
                if (registerResult.isSuccess) {
                    val authData = registerResult.getOrNull()!!
                    // Save session data
                    sessionManager.saveAuthTokens(authData.data.token, authData.data.refreshToken)
                    sessionManager.saveUser(authData.data.user)
                } else {
                    throw registerResult.exceptionOrNull() ?: Exception("Registration failed")
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    signupSuccess = true
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Signup failed. Please try again."
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }
}

data class SignupUiState(
    val isLoading: Boolean = false,
    val errorMessage: String = "",
    val signupSuccess: Boolean = false
)
