package com.clutch.app.data.repository

import com.clutch.app.data.model.Notification
import com.clutch.app.data.model.NotificationPreferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationsRepository @Inject constructor() {
    
    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: Flow<List<Notification>> = _notifications.asStateFlow()
    
    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: Flow<Int> = _unreadCount.asStateFlow()
    
    private val _preferences = MutableStateFlow(
        NotificationPreferences(
            email = true,
            push = true,
            sms = false,
            marketing = false
        )
    )
    val preferences: Flow<NotificationPreferences> = _preferences.asStateFlow()
    
    /**
     * Get all notifications
     */
    fun getAllNotifications(): List<Notification> {
        return _notifications.value
    }
    
    /**
     * Get unread notifications
     */
    fun getUnreadNotifications(): List<Notification> {
        return _notifications.value.filter { !it.isRead }
    }
    
    /**
     * Mark notification as read
     */
    fun markAsRead(notificationId: String) {
        val updatedNotifications = _notifications.value.map { notification ->
            if (notification.id == notificationId) {
                notification.copy(isRead = true)
            } else notification
        }
        _notifications.value = updatedNotifications
        updateUnreadCount()
    }
    
    /**
     * Mark all notifications as read
     */
    fun markAllAsRead() {
        val updatedNotifications = _notifications.value.map { notification ->
            notification.copy(isRead = true)
        }
        _notifications.value = updatedNotifications
        updateUnreadCount()
    }
    
    /**
     * Delete notification
     */
    fun deleteNotification(notificationId: String) {
        val updatedNotifications = _notifications.value.filter { it.id != notificationId }
        _notifications.value = updatedNotifications
        updateUnreadCount()
    }
    
    /**
     * Add new notification
     */
    fun addNotification(notification: Notification) {
        val updatedNotifications = listOf(notification) + _notifications.value
        _notifications.value = updatedNotifications
        updateUnreadCount()
    }
    
    /**
     * Update notification preferences
     */
    fun updatePreferences(preferences: NotificationPreferences) {
        _preferences.value = preferences
    }
    
    /**
     * Create sample notifications for demo
     */
    fun createSampleNotifications() {
        val sampleNotifications = listOf(
            Notification(
                id = "1",
                title = "Order Confirmed",
                message = "Your order #ORD-2024-001 has been confirmed and is being processed.",
                type = NotificationType.ORDER_UPDATE,
                isRead = false,
                timestamp = System.currentTimeMillis() - 3600000, // 1 hour ago
                data = mapOf("orderId" to "ORD-2024-001")
            ),
            Notification(
                id = "2",
                title = "Service Reminder",
                message = "Your vehicle is due for an oil change. Book now to avoid any issues.",
                type = NotificationType.SERVICE_REMINDER,
                isRead = false,
                timestamp = System.currentTimeMillis() - 7200000, // 2 hours ago
                data = mapOf("serviceType" to "oil_change")
            ),
            Notification(
                id = "3",
                title = "Part Available",
                message = "The brake pads you were looking for are now back in stock!",
                type = NotificationType.PART_AVAILABLE,
                isRead = true,
                timestamp = System.currentTimeMillis() - 86400000, // 1 day ago
                data = mapOf("partId" to "part_123")
            ),
            Notification(
                id = "4",
                title = "Booking Confirmed",
                message = "Your service appointment for tomorrow at 10:00 AM has been confirmed.",
                type = NotificationType.BOOKING_UPDATE,
                isRead = true,
                timestamp = System.currentTimeMillis() - 172800000, // 2 days ago
                data = mapOf("bookingId" to "BK-2024-001")
            ),
            Notification(
                id = "5",
                title = "Welcome to Clutch!",
                message = "Thank you for joining Clutch. Get started by adding your vehicle details.",
                type = NotificationType.WELCOME,
                isRead = true,
                timestamp = System.currentTimeMillis() - 259200000, // 3 days ago
                data = emptyMap()
            )
        )
        
        _notifications.value = sampleNotifications
        updateUnreadCount()
    }
    
    /**
     * Update unread count
     */
    private fun updateUnreadCount() {
        _unreadCount.value = _notifications.value.count { !it.isRead }
    }
    
    /**
     * Simulate real-time notification
     */
    fun simulateRealtimeNotification() {
        val newNotification = Notification(
            id = System.currentTimeMillis().toString(),
            title = "New Message",
            message = "You have a new message from your service center.",
            type = NotificationType.MESSAGE,
            isRead = false,
            timestamp = System.currentTimeMillis(),
            data = emptyMap()
        )
        addNotification(newNotification)
    }
}

/**
 * Notification data class
 */
data class Notification(
    val id: String,
    val title: String,
    val message: String,
    val type: NotificationType,
    val isRead: Boolean,
    val timestamp: Long,
    val data: Map<String, String> = emptyMap()
)

/**
 * Notification types
 */
enum class NotificationType {
    ORDER_UPDATE,
    SERVICE_REMINDER,
    PART_AVAILABLE,
    BOOKING_UPDATE,
    MESSAGE,
    WELCOME,
    PROMOTION,
    SYSTEM
}
