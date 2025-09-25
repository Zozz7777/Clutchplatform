package com.clutch.partners.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.model.PartnerUser
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.data.repository.PartnersRepository
import com.clutch.partners.data.local.PreferencesManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val user: PartnerUser? = null,
    val error: String? = null
)

class AuthViewModel(
    private val repository: PartnersRepository,
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    init {
        checkAuthStatus()
    }

    private fun checkAuthStatus() {
        viewModelScope.launch {
            val token = preferencesManager.getAuthToken()
            if (token != null) {
                try {
                    val user = repository.getCurrentUser()
                    _authState.value = AuthState(
                        isAuthenticated = true,
                        user = user
                    )
                } catch (e: Exception) {
                    preferencesManager.clearAuthToken()
                    _authState.value = AuthState(isAuthenticated = false)
                }
            }
        }
    }

    fun signIn(emailOrPhone: String, password: String) {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            try {
                val result = repository.signIn(emailOrPhone, password)
                preferencesManager.saveAuthToken(result.token)
                _authState.value = AuthState(
                    isLoading = false,
                    isAuthenticated = true,
                    user = result.user
                )
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Sign in failed"
                )
            }
        }
    }

    fun signUp(
        partnerId: String,
        email: String,
        phone: String,
        password: String,
        businessName: String,
        ownerName: String,
        partnerType: PartnerType
    ) {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            try {
                val result = repository.signUp(
                    partnerId, email, phone, password,
                    businessName, ownerName, partnerType
                )
                preferencesManager.saveAuthToken(result.token)
                _authState.value = AuthState(
                    isLoading = false,
                    isAuthenticated = true,
                    user = result.user
                )
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Sign up failed"
                )
            }
        }
    }

    fun requestToJoin(
        businessName: String,
        ownerName: String,
        email: String,
        phone: String,
        partnerType: PartnerType,
        businessAddress: String
    ) {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            try {
                repository.requestToJoin(
                    businessName, ownerName, email, phone,
                    partnerType, businessAddress
                )
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = null
                )
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Request to join failed"
                )
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            preferencesManager.clearAuthToken()
            _authState.value = AuthState(isAuthenticated = false)
        }
    }

    fun clearError() {
        _authState.value = _authState.value.copy(error = null)
    }
}
