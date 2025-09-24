package com.clutch.partners.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.clutch.partners.MainActivity
import com.clutch.partners.R
import com.clutch.partners.data.model.NotificationType
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NotificationManager(private val context: Context) {
    
    companion object {
        const val CHANNEL_ID_ORDERS = "orders_channel"
        const val CHANNEL_ID_PAYMENTS = "payments_channel"
        const val CHANNEL_ID_SYSTEM = "system_channel"
        const val NOTIFICATION_ID_ORDERS = 1001
        const val NOTIFICATION_ID_PAYMENTS = 1002
        const val NOTIFICATION_ID_SYSTEM = 1003
    }
    
    init {
        createNotificationChannels()
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Orders channel
            val ordersChannel = NotificationChannel(
                CHANNEL_ID_ORDERS,
                "Orders & Appointments",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for new orders and appointment updates"
                enableVibration(true)
                enableLights(true)
            }
            
            // Payments channel
            val paymentsChannel = NotificationChannel(
                CHANNEL_ID_PAYMENTS,
                "Payments",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications for payment updates and payouts"
                enableVibration(true)
            }
            
            // System channel
            val systemChannel = NotificationChannel(
                CHANNEL_ID_SYSTEM,
                "System Notifications",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "General system notifications and updates"
            }
            
            notificationManager.createNotificationChannels(
                listOf(ordersChannel, paymentsChannel, systemChannel)
            )
        }
    }
    
    fun showNotification(
        title: String,
        message: String,
        type: NotificationType,
        data: Map<String, String> = emptyMap()
    ) {
        val channelId = when (type) {
            NotificationType.NEW_ORDER, NotificationType.ORDER_UPDATE -> CHANNEL_ID_ORDERS
            NotificationType.PAYMENT_RECEIVED, NotificationType.PAYOUT_ISSUED -> CHANNEL_ID_PAYMENTS
            NotificationType.SYSTEM_UPDATE, NotificationType.INVOICE_REJECTED -> CHANNEL_ID_SYSTEM
        }
        
        val notificationId = when (type) {
            NotificationType.NEW_ORDER, NotificationType.ORDER_UPDATE -> NOTIFICATION_ID_ORDERS
            NotificationType.PAYMENT_RECEIVED, NotificationType.PAYOUT_ISSUED -> NOTIFICATION_ID_PAYMENTS
            NotificationType.SYSTEM_UPDATE, NotificationType.INVOICE_REJECTED -> NOTIFICATION_ID_SYSTEM
        }
        
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .build()
        
        with(NotificationManagerCompat.from(context)) {
            notify(notificationId, notification)
        }
    }
    
    fun subscribeToTopics(partnerId: String, partnerType: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                FirebaseMessaging.getInstance().subscribeToTopic("partners_$partnerId")
                FirebaseMessaging.getInstance().subscribeToTopic("partner_type_$partnerType")
                FirebaseMessaging.getInstance().subscribeToTopic("all_partners")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    fun unsubscribeFromTopics(partnerId: String, partnerType: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                FirebaseMessaging.getInstance().unsubscribeFromTopic("partners_$partnerId")
                FirebaseMessaging.getInstance().unsubscribeFromTopic("partner_type_$partnerType")
                FirebaseMessaging.getInstance().unsubscribeFromTopic("all_partners")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    fun handleRemoteMessage(remoteMessage: RemoteMessage) {
        val title = remoteMessage.notification?.title ?: "Clutch Partners"
        val message = remoteMessage.notification?.body ?: "You have a new notification"
        val data = remoteMessage.data
        
        val type = when (data["type"]) {
            "new_order" -> NotificationType.NEW_ORDER
            "order_update" -> NotificationType.ORDER_UPDATE
            "payment_received" -> NotificationType.PAYMENT_RECEIVED
            "payout_issued" -> NotificationType.PAYOUT_ISSUED
            "invoice_rejected" -> NotificationType.INVOICE_REJECTED
            else -> NotificationType.SYSTEM_UPDATE
        }
        
        showNotification(title, message, type, data)
    }
}
