import { Notification } from 'electron';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{
    type: 'button';
    text: string;
  }>;
}

export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();

  async initialize() {
    // Check if notifications are supported
    if (!Notification.isSupported()) {
      console.warn('Desktop notifications are not supported on this system');
    }
  }

  async show(notificationData: NotificationData): Promise<{ success: boolean; id?: string }> {
    try {
      if (!Notification.isSupported()) {
        console.log('Notification (not supported):', notificationData.title, notificationData.body);
        return { success: false };
      }

      const notification = new Notification({
        title: notificationData.title,
        body: notificationData.body,
        icon: notificationData.icon || 'assets/icons/app-icon.png',
        sound: notificationData.sound !== false ? 'default' : 'none',
        urgency: notificationData.urgency || 'normal',
        actions: notificationData.actions || []
      });

      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.notifications.set(id, notification);

      // Handle notification events
      notification.on('click', () => {
        console.log('Notification clicked:', id);
        this.notifications.delete(id);
      });

      notification.on('close', () => {
        console.log('Notification closed:', id);
        this.notifications.delete(id);
      });

      notification.on('action', (event, index) => {
        console.log('Notification action clicked:', id, index);
        this.notifications.delete(id);
      });

      notification.show();

      return { success: true, id };
    } catch (error) {
      console.error('Show notification error:', error);
      return { success: false };
    }
  }

  async showOrderNotification(order: any) {
    const notificationData: NotificationData = {
      title: 'طلب جديد',
      body: `طلب جديد من ${order.customer_name} - ${order.total} ${order.currency || 'EGP'}`,
      urgency: 'normal',
      actions: [
        {
          type: 'button',
          text: 'عرض الطلب'
        }
      ]
    };

    return await this.show(notificationData);
  }

  async showPaymentNotification(payment: any) {
    const status = payment.status === 'paid' ? 'تم الدفع' : 'فشل الدفع';
    const notificationData: NotificationData = {
      title: 'تحديث الدفع',
      body: `${status} - ${payment.amount} ${payment.currency || 'EGP'}`,
      urgency: payment.status === 'paid' ? 'normal' : 'critical',
      actions: [
        {
          type: 'button',
          text: 'عرض التفاصيل'
        }
      ]
    };

    return await this.show(notificationData);
  }

  async showSyncNotification(message: string, isError: boolean = false) {
    const notificationData: NotificationData = {
      title: 'مزامنة البيانات',
      body: message,
      urgency: isError ? 'critical' : 'normal'
    };

    return await this.show(notificationData);
  }

  async showLowStockNotification(product: any) {
    const notificationData: NotificationData = {
      title: 'مخزون منخفض',
      body: `المنتج ${product.name} يحتاج إعادة تموين (${product.quantity} متبقي)`,
      urgency: 'normal',
      actions: [
        {
          type: 'button',
          text: 'عرض المنتج'
        }
      ]
    };

    return await this.show(notificationData);
  }

  async showErrorNotification(error: string) {
    const notificationData: NotificationData = {
      title: 'خطأ في النظام',
      body: error,
      urgency: 'critical',
      actions: [
        {
          type: 'button',
          text: 'عرض التفاصيل'
        }
      ]
    };

    return await this.show(notificationData);
  }

  async showSuccessNotification(message: string) {
    const notificationData: NotificationData = {
      title: 'تم بنجاح',
      body: message,
      urgency: 'normal'
    };

    return await this.show(notificationData);
  }

  closeAll() {
    this.notifications.forEach((notification, id) => {
      notification.close();
      this.notifications.delete(id);
    });
  }

  close(id: string) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.close();
      this.notifications.delete(id);
    }
  }
}
