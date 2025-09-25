import { Notification, ipcMain, BrowserWindow } from 'electron';
import { DatabaseManager } from './database';

export interface NotificationData {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{
    type: 'button';
    text: string;
    action: string;
  }>;
  data?: any;
  category?: string;
  tag?: string;
  timestamp?: string;
  read?: boolean;
  persistent?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: {
    orders: boolean;
    payments: boolean;
    inventory: boolean;
    system: boolean;
    marketing: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export class EnhancedNotificationManager {
  private database: DatabaseManager;
  private notifications: Map<string, Notification> = new Map();
  private settings: NotificationSettings;
  private isQuietHours: boolean = false;
  private quietHoursInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.database = new DatabaseManager();
    this.settings = this.getDefaultSettings();
    this.setupIPC();
    this.startQuietHoursCheck();
  }

  async initialize() {
    await this.loadSettings();
    this.checkQuietHours();
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      sound: true,
      desktop: true,
      email: false,
      sms: false,
      push: false,
      categories: {
        orders: true,
        payments: true,
        inventory: true,
        system: true,
        marketing: false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  private async loadSettings() {
    try {
      const settingsJson = await this.database.getSetting('notification_settings');
      if (settingsJson) {
        this.settings = { ...this.getDefaultSettings(), ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await this.database.setSetting('notification_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  private setupIPC() {
    // Send notification
    ipcMain.handle('send-notification', async (event, notificationData: NotificationData) => {
      return await this.sendNotification(notificationData);
    });

    // Get notifications
    ipcMain.handle('get-notifications', async (event, limit: number = 50, offset: number = 0) => {
      return await this.getNotifications(limit, offset);
    });

    // Mark notification as read
    ipcMain.handle('mark-notification-read', async (event, notificationId: string) => {
      return await this.markAsRead(notificationId);
    });

    // Mark all notifications as read
    ipcMain.handle('mark-all-notifications-read', async () => {
      return await this.markAllAsRead();
    });

    // Delete notification
    ipcMain.handle('delete-notification', async (event, notificationId: string) => {
      return await this.deleteNotification(notificationId);
    });

    // Get notification settings
    ipcMain.handle('get-notification-settings', async () => {
      return this.settings;
    });

    // Update notification settings
    ipcMain.handle('update-notification-settings', async (event, newSettings: Partial<NotificationSettings>) => {
      return await this.updateSettings(newSettings);
    });

    // Test notification
    ipcMain.handle('test-notification', async () => {
      return await this.sendTestNotification();
    });
  }

  async sendNotification(notificationData: NotificationData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Check if notifications are enabled
      if (!this.settings.enabled) {
        return { success: false, error: 'Notifications are disabled' };
      }

      // Check category settings
      if (notificationData.category && !this.settings.categories[notificationData.category as keyof typeof this.settings.categories]) {
        return { success: false, error: 'Category notifications are disabled' };
      }

      // Check quiet hours
      if (this.isQuietHours && !notificationData.urgency || notificationData.urgency !== 'critical') {
        return { success: false, error: 'Quiet hours active' };
      }

      const id = notificationData.id || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      // Store in database
      await this.database.exec(
        `INSERT INTO notifications (
          id, title, body, icon, sound, urgency, actions, data, category, tag, 
          timestamp, read, persistent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          id,
          notificationData.title,
          notificationData.body,
          notificationData.icon || 'assets/icons/app-icon.png',
          notificationData.sound !== false ? 1 : 0,
          notificationData.urgency || 'normal',
          JSON.stringify(notificationData.actions || []),
          JSON.stringify(notificationData.data || {}),
          notificationData.category || 'system',
          notificationData.tag || '',
          timestamp,
          0, // not read
          notificationData.persistent ? 1 : 0
        ]
      );

      // Send desktop notification if enabled
      if (this.settings.desktop) {
        await this.sendDesktopNotification({
          ...notificationData,
          id,
          timestamp
        });
      }

      // Send email notification if enabled
      if (this.settings.email) {
        await this.sendEmailNotification({
          ...notificationData,
          id,
          timestamp
        });
      }

      // Send SMS notification if enabled
      if (this.settings.sms) {
        await this.sendSMSNotification({
          ...notificationData,
          id,
          timestamp
        });
      }

      // Send push notification if enabled
      if (this.settings.push) {
        await this.sendPushNotification({
          ...notificationData,
          id,
          timestamp
        });
      }

      // Notify renderer process
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('new-notification', {
          ...notificationData,
          id,
          timestamp
        });
      }

      return { success: true, id };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async sendDesktopNotification(notificationData: NotificationData) {
    try {
      if (!Notification.isSupported()) {
        console.warn('Desktop notifications not supported');
        return;
      }

      const notification = new Notification({
        title: notificationData.title,
        body: notificationData.body,
        icon: notificationData.icon || 'assets/icons/app-icon.png',
        sound: notificationData.sound !== false ? 'default' : 'none',
        urgency: notificationData.urgency || 'normal',
        actions: notificationData.actions || []
      });

      // Handle notification events
      notification.on('click', () => {
        this.markAsRead(notificationData.id!);
        this.focusMainWindow();
      });

      notification.on('close', () => {
        this.notifications.delete(notificationData.id!);
      });

      notification.on('action', (event, index) => {
        if (notificationData.actions && notificationData.actions[index]) {
          this.handleNotificationAction(notificationData.actions[index].action, notificationData.data);
        }
      });

      notification.show();
      this.notifications.set(notificationData.id!, notification);

      // Auto-close after 10 seconds for non-persistent notifications
      if (!notificationData.persistent) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('Failed to send desktop notification:', error);
    }
  }

  private async sendEmailNotification(notificationData: NotificationData) {
    try {
      // This would integrate with an email service like SendGrid, AWS SES, etc.
      console.log('Email notification:', notificationData.title, notificationData.body);
      
      // For now, just log - in production, you'd call your email service
      await this.database.exec(
        'INSERT INTO notification_log (type, notification_id, status, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        ['email', notificationData.id, 'sent']
      );
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendSMSNotification(notificationData: NotificationData) {
    try {
      // This would integrate with an SMS service like Twilio, AWS SNS, etc.
      console.log('SMS notification:', notificationData.title, notificationData.body);
      
      // For now, just log - in production, you'd call your SMS service
      await this.database.exec(
        'INSERT INTO notification_log (type, notification_id, status, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        ['sms', notificationData.id, 'sent']
      );
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  private async sendPushNotification(notificationData: NotificationData) {
    try {
      // This would integrate with a push notification service like FCM, OneSignal, etc.
      console.log('Push notification:', notificationData.title, notificationData.body);
      
      // For now, just log - in production, you'd call your push service
      await this.database.exec(
        'INSERT INTO notification_log (type, notification_id, status, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        ['push', notificationData.id, 'sent']
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private handleNotificationAction(action: string, data?: any) {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('notification-action', { action, data });
    }
  }

  private focusMainWindow() {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  }

  async getNotifications(limit: number = 50, offset: number = 0): Promise<NotificationData[]> {
    try {
      const result = await this.database.query(
        `SELECT * FROM notifications 
         ORDER BY timestamp DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return (result || []).map(row => ({
        id: row.id,
        title: row.title,
        body: row.body,
        icon: row.icon,
        sound: row.sound === 1,
        urgency: row.urgency,
        actions: JSON.parse(row.actions || '[]'),
        data: JSON.parse(row.data || '{}'),
        category: row.category,
        tag: row.tag,
        timestamp: row.timestamp,
        read: row.read === 1,
        persistent: row.persistent === 1
      }));
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await this.database.exec(
        'UPDATE notifications SET read = 1 WHERE id = ?',
        [notificationId]
      );

      // Close desktop notification if it exists
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notification.close();
        this.notifications.delete(notificationId);
      }

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await this.database.exec('UPDATE notifications SET read = 1 WHERE read = 0');

      // Close all desktop notifications
      this.notifications.forEach(notification => notification.close());
      this.notifications.clear();

      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await this.database.exec('DELETE FROM notifications WHERE id = ?', [notificationId]);

      // Close desktop notification if it exists
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notification.close();
        this.notifications.delete(notificationId);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return false;
    }
  }

  async sendTestNotification(): Promise<{ success: boolean; error?: string }> {
    return await this.sendNotification({
      title: 'Test Notification',
      body: 'This is a test notification to verify the system is working correctly.',
      category: 'system',
      urgency: 'normal'
    });
  }

  // Quiet hours management
  private startQuietHoursCheck() {
    this.quietHoursInterval = setInterval(() => {
      this.checkQuietHours();
    }, 60000); // Check every minute
  }

  private checkQuietHours() {
    if (!this.settings.quietHours.enabled) {
      this.isQuietHours = false;
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      this.isQuietHours = currentTime >= startTime || currentTime < endTime;
    } else {
      this.isQuietHours = currentTime >= startTime && currentTime < endTime;
    }
  }

  // Convenience methods for common notification types
  async notifyNewOrder(orderId: string, customerName: string) {
    return await this.sendNotification({
      title: 'طلب جديد',
      body: `طلب جديد من ${customerName} - رقم الطلب: ${orderId}`,
      category: 'orders',
      urgency: 'normal',
      data: { orderId, type: 'new_order' },
      actions: [
        { type: 'button', text: 'عرض الطلب', action: 'view_order' }
      ]
    });
  }

  async notifyPaymentUpdate(orderId: string, status: string, amount: number) {
    const statusText = status === 'paid' ? 'مدفوع' : status === 'rejected' ? 'مرفوض' : 'معلق';
    return await this.sendNotification({
      title: 'تحديث الدفع',
      body: `الدفع للطلب ${orderId}: ${statusText} - ${amount} EGP`,
      category: 'payments',
      urgency: status === 'rejected' ? 'critical' : 'normal',
      data: { orderId, status, amount, type: 'payment_update' },
      actions: [
        { type: 'button', text: 'عرض التفاصيل', action: 'view_payment' }
      ]
    });
  }

  async notifyLowStock(productName: string, currentStock: number) {
    return await this.sendNotification({
      title: 'مخزون منخفض',
      body: `${productName}: المخزون الحالي ${currentStock} وحدة`,
      category: 'inventory',
      urgency: 'normal',
      data: { productName, currentStock, type: 'low_stock' },
      actions: [
        { type: 'button', text: 'إدارة المخزون', action: 'manage_inventory' }
      ]
    });
  }

  async notifySyncError(error: string) {
    return await this.sendNotification({
      title: 'خطأ في المزامنة',
      body: `فشل في مزامنة البيانات: ${error}`,
      category: 'system',
      urgency: 'critical',
      data: { error, type: 'sync_error' },
      actions: [
        { type: 'button', text: 'إعادة المحاولة', action: 'retry_sync' }
      ]
    });
  }

  async cleanup() {
    if (this.quietHoursInterval) {
      clearInterval(this.quietHoursInterval);
    }
    
    this.notifications.forEach(notification => notification.close());
    this.notifications.clear();
  }
}
