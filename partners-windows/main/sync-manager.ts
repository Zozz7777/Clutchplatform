import { io, Socket } from 'socket.io-client';
import { DatabaseManager } from './database';

interface SyncOperation {
  operationId: string;
  entityType: string;
  entityId: string;
  operationType: 'create' | 'update' | 'delete' | 'sync';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
}

export class SyncManager {
  private socket: Socket | null = null;
  private database: DatabaseManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = false;
  private partnerId: string = '';
  private deviceId: string = '';
  private apiUrl: string = 'https://clutch-main-nk7x.onrender.com';
  private syncQueue: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private lastSyncTimestamp: string | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private conflictResolutionStrategy: 'local_wins' | 'server_wins' | 'manual' = 'local_wins';
  private pendingOperations: SyncOperation[] = [];

  constructor() {
    this.database = new DatabaseManager();
  }

  async initialize() {
    // Get partner and device info from settings
    this.partnerId = await this.database.getSetting('partner_id') || '';
    this.deviceId = await this.database.getSetting('device_id') || '';

    if (this.partnerId && this.deviceId) {
      await this.connect();
      this.startSyncInterval();
    }
  }

  private async connect() {
    try {
      this.socket = io(`${this.apiUrl}/ws/partners/${this.partnerId}`, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        // Connected to sync server
        this.isOnline = true;
        this.socket?.emit('device_join', { deviceId: this.deviceId });
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from sync server');
        this.isOnline = false;
      });

      this.socket.on('new_order', (order) => {
        this.handleNewOrder(order);
      });

      this.socket.on('payment_update', (payment) => {
        this.handlePaymentUpdate(payment);
      });

      this.socket.on('sync_conflict', (conflict) => {
        this.handleSyncConflict(conflict);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Sync connection error:', error instanceof Error ? error.message : String(error));
        this.isOnline = false;
      });

    } catch (error) {
      console.error('Failed to connect to sync server:', error instanceof Error ? error.message : String(error));
      this.isOnline = false;
    }
  }

  private async startSyncInterval() {
    const interval = parseInt(await this.database.getSetting('sync_interval') || '30') * 60 * 1000;
    
    this.syncInterval = setInterval(async () => {
      if (this.isOnline) {
        await this.syncPendingOperations();
      }
    }, interval);
  }

  async pushOperations(operations: SyncOperation[]) {
    try {
      // Store operations locally first
      for (const operation of operations) {
        await this.database.exec(
          `INSERT OR REPLACE INTO sync_operations 
           (operation_id, entity_type, entity_id, operation_type, data, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            operation.operationId,
            operation.entityType,
            operation.entityId,
            operation.operationType,
            JSON.stringify(operation.data),
            'pending'
          ]
        );
      }

      // Push to server if online
      if (this.isOnline) {
        const response = await fetch(`${this.apiUrl}/api/v1/partners/${this.partnerId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.database.getSetting('auth_token')}`
          },
          body: JSON.stringify({ operations })
        });

        if (response.ok) {
          const result = await response.json();
          await this.handleSyncResponse(result);
        } else {
          console.error('Failed to push operations to server');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Push operations error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async pullChanges(since?: string) {
    try {
      if (!this.isOnline) {
        return { success: false, error: 'Offline' };
      }

      const response = await fetch(
        `${this.apiUrl}/api/v1/partners/${this.partnerId}/sync?since=${since || ''}`,
        {
          headers: {
            'Authorization': `Bearer ${await this.database.getSetting('auth_token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        await this.handlePullResponse(result);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: 'Failed to pull changes' };
      }
    } catch (error) {
      console.error('Pull changes error:', error instanceof Error ? error.message : String(error));
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async getStatus() {
    try {
      const pendingOps = await this.database.query(
        'SELECT COUNT(*) as count FROM sync_operations WHERE status = ?',
        ['pending']
      );

      const failedOps = await this.database.query(
        'SELECT COUNT(*) as count FROM sync_operations WHERE status = ?',
        ['failed']
      );

      const lastSync = await this.database.getSetting('last_sync');

      return {
        isOnline: this.isOnline,
        pendingOperations: pendingOps[0]?.count || 0,
        failedOperations: failedOps[0]?.count || 0,
        lastSync: lastSync,
        partnerId: this.partnerId,
        deviceId: this.deviceId
      };
    } catch (error) {
      console.error('Get sync status error:', error instanceof Error ? error.message : String(error));
      return {
        isOnline: false,
        pendingOperations: 0,
        failedOperations: 0,
        lastSync: null,
        partnerId: '',
        deviceId: ''
      };
    }
  }

  private async syncPendingOperations() {
    try {
      const pendingOps = await this.database.query(
        'SELECT * FROM sync_operations WHERE status = ? ORDER BY created_at',
        ['pending']
      );

      if (pendingOps.length > 0) {
        const operations = pendingOps.map(op => ({
          operationId: op.operation_id,
          entityType: op.entity_type,
          entityId: op.entity_id,
          operationType: op.operation_type,
          data: JSON.parse(op.data),
          status: op.status
        }));

        await this.pushOperations(operations);
      }

      // Update last sync time
      await this.database.setSetting('last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Sync pending operations error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handleSyncResponse(response: any) {
    try {
      for (const operation of response.data.operations) {
        await this.database.exec(
          'UPDATE sync_operations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE operation_id = ?',
          [operation.status, operation.operationId]
        );
      }
    } catch (error) {
      console.error('Handle sync response error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handlePullResponse(response: any) {
    try {
      for (const operation of response.data.operations) {
        // Apply changes to local database
        await this.applyOperation(operation);
      }
    } catch (error) {
      console.error('Handle pull response error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async applyOperation(operation: any) {
    try {
      switch (operation.entityType) {
        case 'order':
          await this.applyOrderOperation(operation);
          break;
        case 'inventory':
          await this.applyInventoryOperation(operation);
          break;
        case 'payment':
          await this.applyPaymentOperation(operation);
          break;
        default:
          console.log('Unknown entity type:', operation.entityType);
      }
    } catch (error) {
      console.error('Apply operation error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async applyOrderOperation(operation: any) {
    const { operationType, data } = operation;

    switch (operationType) {
      case 'create':
      case 'update':
        await this.database.exec(
          `INSERT OR REPLACE INTO orders (
            order_id, customer_name, customer_phone, customer_email,
            items, subtotal, tax, discount, total, payment_method,
            payment_status, order_status, notes, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.order_id, data.customer_name, data.customer_phone, data.customer_email,
            JSON.stringify(data.items), data.subtotal, data.tax, data.discount, data.total,
            data.payment_method, data.payment_status, data.order_status, data.notes,
            data.created_by, data.created_at, data.updated_at
          ]
        );
        break;
      case 'delete':
        await this.database.exec('DELETE FROM orders WHERE order_id = ?', [data.order_id]);
        break;
    }
  }

  private async applyInventoryOperation(operation: any) {
    const { operationType, data } = operation;

    switch (operationType) {
      case 'create':
      case 'update':
        await this.database.exec(
          `INSERT OR REPLACE INTO products (
            sku, name, description, category, brand, model,
            cost_price, sale_price, quantity, min_quantity, barcode,
            images, specifications, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.sku, data.name, data.description, data.category, data.brand, data.model,
            data.cost_price, data.sale_price, data.quantity, data.min_quantity, data.barcode,
            JSON.stringify(data.images || []), JSON.stringify(data.specifications || {}),
            data.is_active ? 1 : 0, data.created_at, data.updated_at
          ]
        );
        break;
      case 'delete':
        await this.database.exec('DELETE FROM products WHERE sku = ?', [data.sku]);
        break;
    }
  }

  private async applyPaymentOperation(operation: any) {
    const { operationType, data } = operation;

    switch (operationType) {
      case 'create':
      case 'update':
        await this.database.exec(
          `INSERT OR REPLACE INTO payments (
            payment_id, order_id, amount, method, status, reference, processed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.payment_id, data.order_id, data.amount, data.method,
            data.status, data.reference, data.processed_at, data.created_at
          ]
        );
        break;
      case 'delete':
        await this.database.exec('DELETE FROM payments WHERE payment_id = ?', [data.payment_id]);
        break;
    }
  }

  private async handleNewOrder(order: any) {
    try {
      await this.applyOrderOperation({
        operationType: 'create',
        data: order
      });
      console.log('New order received and applied:', order.order_id);
    } catch (error) {
      console.error('Handle new order error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handlePaymentUpdate(payment: any) {
    try {
      await this.applyPaymentOperation({
        operationType: 'update',
        data: payment
      });
      console.log('Payment update received and applied:', payment.payment_id);
    } catch (error) {
      console.error('Handle payment update error:', error instanceof Error ? error.message : String(error));
    }
  }

  private async handleSyncConflict(conflict: any) {
    try {
      // Store conflict for manual resolution
      await this.database.exec(
        `INSERT OR REPLACE INTO sync_operations 
         (operation_id, entity_type, entity_id, operation_type, data, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          conflict.operationId,
          conflict.entityType,
          conflict.entityId,
          conflict.operationType,
          JSON.stringify(conflict),
          'conflict'
        ]
      );
      console.log('Sync conflict detected:', conflict.operationId);
    } catch (error) {
      console.error('Handle sync conflict error:', error instanceof Error ? error.message : String(error));
    }
  }

  async stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isOnline = false;
  }
}
