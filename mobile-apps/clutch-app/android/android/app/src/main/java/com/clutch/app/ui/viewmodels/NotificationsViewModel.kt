package com.clutch.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.repository.Notification
import com.clutch.app.data.repository.NotificationType
import com.clutch.app.data.repository.NotificationsRepository
import com.clutch.app.data.model.NotificationPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val notificationsRepository: NotificationsRepository
) : ViewModel() {
    
    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()
    
    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()
    
    private val _preferences = MutableStateFlow(
        NotificationPreferences(
            email = true,
            push = true,
            sms = false,
            marketing = false
        )
    )
    val preferences: StateFlow<NotificationPreferences> = _preferences.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    init {
        loadNotifications()
        loadPreferences()
    }
    
    /**
     * Load all notifications
     */
    fun loadNotifications() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                // In a real app, this would fetch from API
                // For now, we'll use sample data
                notificationsRepository.createSampleNotifications()
                
                // Observe notifications from repository
                notificationsRepository.notifications.collect { notifications ->
                    _notifications.value = notifications
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load notifications"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Load notification preferences
     */
    fun loadPreferences() {
        viewModelScope.launch {
            try {
                notificationsRepository.preferences.collect { prefs ->
                    _preferences.value = prefs
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load preferences"
            }
        }
    }
    
    /**
     * Mark notification as read
     */
    fun markAsRead(notificationId: String) {
        viewModelScope.launch {
            try {
                notificationsRepository.markAsRead(notificationId)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to mark notification as read"
            }
        }
    }
    
    /**
     * Mark all notifications as read
     */
    fun markAllAsRead() {
        viewModelScope.launch {
            try {
                notificationsRepository.markAllAsRead()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to mark all notifications as read"
            }
        }
    }
    
    /**
     * Delete notification
     */
    fun deleteNotification(notificationId: String) {
        viewModelScope.launch {
            try {
                notificationsRepository.deleteNotification(notificationId)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete notification"
            }
        }
    }
    
    /**
     * Update notification preferences
     */
    fun updatePreferences(preferences: NotificationPreferences) {
        viewModelScope.launch {
            try {
                notificationsRepository.updatePreferences(preferences)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to update preferences"
            }
        }
    }
    
    /**
     * Get notifications by type
     */
    fun getNotificationsByType(type: NotificationType): List<Notification> {
        return _notifications.value.filter { it.type == type }
    }
    
    /**
     * Get unread notifications
     */
    fun getUnreadNotifications(): List<Notification> {
        return _notifications.value.filter { !it.isRead }
    }
    
    /**
     * Get recent notifications (last 7 days)
     */
    fun getRecentNotifications(): List<Notification> {
        val sevenDaysAgo = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000)
        return _notifications.value.filter { it.timestamp >= sevenDaysAgo }
    }
    
    /**
     * Refresh notifications
     */
    fun refreshNotifications() {
        loadNotifications()
    }
    
    /**
     * Simulate real-time notification
     */
    fun simulateRealtimeNotification() {
        viewModelScope.launch {
            try {
                notificationsRepository.simulateRealtimeNotification()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to simulate notification"
            }
        }
    }
    
    /**
     * Clear error
     */
    fun clearError() {
        _error.value = null
    }
    
    /**
     * Get notification statistics
     */
    fun getNotificationStats(): NotificationStats {
        val notifications = _notifications.value
        return NotificationStats(
            total = notifications.size,
            unread = notifications.count { !it.isRead },
            orderUpdates = notifications.count { it.type == NotificationType.ORDER_UPDATE },
            serviceReminders = notifications.count { it.type == NotificationType.SERVICE_REMINDER },
            partAvailable = notifications.count { it.type == NotificationType.PART_AVAILABLE },
            bookingUpdates = notifications.count { it.type == NotificationType.BOOKING_UPDATE },
            messages = notifications.count { it.type == NotificationType.MESSAGE }
        )
    }
}

/**
 * Notification statistics data class
 */
data class NotificationStats(
    val total: Int = 0,
    val unread: Int = 0,
    val orderUpdates: Int = 0,
    val serviceReminders: Int = 0,
    val partAvailable: Int = 0,
    val bookingUpdates: Int = 0,
    val messages: Int = 0
)
