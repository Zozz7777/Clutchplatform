/**
 * Simplified Auth ViewModel
 * Basic authentication functionality
 */

package com.clutch.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SimpleAuthViewModel @Inject constructor(
    private val authRepository: com.clutch.app.data.repository.AuthRepository
) : ViewModel() {
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()
    
    fun signUp(
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val authData = authRepository.register(
                    email = email,
                    password = password,
                    firstName = firstName,
                    lastName = lastName,
                    phone = "" // Phone will be added later
                )
                _isAuthenticated.value = true
                
            } catch (e: Exception) {
                _error.value = e.message ?: "Sign up failed"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val authData = authRepository.login(email, password)
                _isAuthenticated.value = true
                
            } catch (e: Exception) {
                _error.value = e.message ?: "Sign in failed"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun signOut() {
        viewModelScope.launch {
            try {
                authRepository.logout()
            } catch (e: Exception) {
                // Log error but continue with local logout
            } finally {
                _isAuthenticated.value = false
                _error.value = null
            }
        }
    }
    
    fun clearError() {
        _error.value = null
    }
}
