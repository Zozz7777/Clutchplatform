package com.clutch.partners.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.api.AuthResponse
import com.clutch.partners.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            authRepository.signIn(email, password).fold(
                onSuccess = { authResponse ->
                    if (authResponse.success) {
                        _authState.value = AuthState.Success(authResponse)
                    } else {
                        _authState.value = AuthState.Error(authResponse.message)
                    }
                },
                onFailure = { exception ->
                    _authState.value = AuthState.Error(exception.message ?: "Sign in failed")
                }
            )
        }
    }
    
    fun signUp(partnerId: String, email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            authRepository.signUp(partnerId, email, password).fold(
                onSuccess = { authResponse ->
                    if (authResponse.success) {
                        _authState.value = AuthState.Success(authResponse)
                    } else {
                        _authState.value = AuthState.Error(authResponse.message)
                    }
                },
                onFailure = { exception ->
                    _authState.value = AuthState.Error(exception.message ?: "Sign up failed")
                }
            )
        }
    }
    
    fun requestToJoin(
        businessName: String,
        address: String,
        ownerName: String,
        phoneNumber: String,
        partnerType: String
    ) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            authRepository.requestToJoin(businessName, address, ownerName, phoneNumber, partnerType).fold(
                onSuccess = { authResponse ->
                    if (authResponse.success) {
                        _authState.value = AuthState.Success(authResponse)
                    } else {
                        _authState.value = AuthState.Error(authResponse.message)
                    }
                },
                onFailure = { exception ->
                    _authState.value = AuthState.Error(exception.message ?: "Request to join failed")
                }
            )
        }
    }
    
    fun clearAuthState() {
        _authState.value = AuthState.Idle
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val authResponse: AuthResponse) : AuthState()
    data class Error(val message: String) : AuthState()
}