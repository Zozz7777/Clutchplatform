package com.clutch.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ForgotPasswordViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ForgotPasswordUiState())
    val uiState: StateFlow<ForgotPasswordUiState> = _uiState.asStateFlow()
    
    fun sendResetCode(emailOrPhone: String) {
        if (emailOrPhone.isBlank()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Email or phone number is required"
            )
            return
        }
        
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
        
        viewModelScope.launch {
            try {
                val result = repository.forgotPassword(emailOrPhone)
                if (result.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isEmailSent = true,
                        emailOrPhone = emailOrPhone
                    )
                } else {
                    val error = result.exceptionOrNull()
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error?.message ?: "Failed to send reset code"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Network error: ${e.message}"
                )
            }
        }
    }
    
    fun resetPassword(emailOrPhone: String, resetCode: String, newPassword: String) {
        if (resetCode.isBlank() || newPassword.isBlank()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Reset code and new password are required"
            )
            return
        }
        
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
        
        viewModelScope.launch {
            try {
                val result = repository.verifyOtp(emailOrPhone, resetCode)
                if (result.isSuccess) {
                    // TODO: Implement password reset API call
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isPasswordReset = true
                    )
                } else {
                    val error = result.exceptionOrNull()
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = error?.message ?: "Invalid reset code"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Network error: ${e.message}"
                )
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }
}

data class ForgotPasswordUiState(
    val isLoading: Boolean = false,
    val isEmailSent: Boolean = false,
    val isPasswordReset: Boolean = false,
    val emailOrPhone: String = "",
    val errorMessage: String = ""
)
