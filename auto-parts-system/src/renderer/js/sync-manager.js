// Real-Time Sync Manager for Clutch Auto Parts System
// databaseManager, apiManager, and uiManager are loaded as scripts and available globally

class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncStatus = 'disconnected';
        this.syncQueue = [];
        this.syncInterval = null;
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds
        this.maxRetryDelay = 30000; // 30 seconds
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncStats = {
            total: 0,
            successful: 0,
            failed: 0,
            pending: 0
        };
        
        this.init();
    }

    async init() {
        await this.loadSyncQueue();
        this.setupEventListeners();
        this.startSyncMonitoring();
        this.updateSyncStatus();
    }

    async initialize() {
        return this.init();
    }

    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus();
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus();
        });

        // Database change events
        this.setupDatabaseChangeListeners();
    }

    setupDatabaseChangeListeners() {
        // Listen for inventory changes
        this.originalAddInventoryItem = window.databaseManager.addInventoryItem;
        this.originalUpdateInventoryItem = window.databaseManager.updateInventoryItem;
        this.originalCreateSale = window.databaseManager.createSale;

        // Override methods to trigger sync
        window.databaseManager.addInventoryItem = async (itemData) => {
            const result = await this.originalAddInventoryItem.call(window.databaseManager, itemData);
            await this.queueSync('inventory', 'create', result.id, itemData);
            return result;
        };

        window.databaseManager.updateInventoryItem = async (id, itemData) => {
            const result = await this.originalUpdateInventoryItem.call(window.databaseManager, id, itemData);
            await this.queueSync('inventory', 'update', id, itemData);
            return result;
        };

        window.databaseManager.createSale = async (saleData) => {
            const result = await this.originalCreateSale.call(window.databaseManager, saleData);
            await this.queueSync('sales', 'create', result.id, saleData);
            return result;
        };
    }

    async queueSync(table, action, recordId, data) {
        try {
            const syncItem = {
                id: this.generateSyncId(),
                table: table,
                action: action,
                record_id: recordId,
                data: data,
                status: 'pending',
                attempts: 0,
                created_at: new Date().toISOString(),
                last_attempt: null,
                error_message: null
            };

            // Add to database queue
            await window.databaseManager.runQuery(
                'INSERT INTO sync_log (table_name, record_id, action, data, sync_status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [table, recordId, action, JSON.stringify(data), 'pending', syncItem.created_at]
            );

            // Add to memory queue
            this.syncQueue.push(syncItem);
            this.syncStats.pending++;

            // Try to sync immediately if online
            if (this.isOnline && !this.syncInProgress) {
                this.processSyncQueue();
            }

            this.updateSyncStatus();
        } catch (error) {
            console.error('Error queuing sync:', error);
        }
    }

    async loadSyncQueue() {
        try {
            const pendingItems = await window.databaseManager.allQuery(
                'SELECT * FROM sync_log WHERE sync_status = ? ORDER BY created_at ASC',
                ['pending']
            );

            this.syncQueue = pendingItems.map(item => ({
                id: item.id,
                table: item.table_name,
                action: item.action,
                record_id: item.record_id,
                data: JSON.parse(item.data || '{}'),
                status: item.sync_status,
                attempts: item.sync_attempts || 0,
                created_at: item.created_at,
                last_attempt: item.last_sync_attempt,
                error_message: null
            }));

            this.syncStats.pending = this.syncQueue.length;
            this.updateSyncStatus();
        } catch (error) {
            console.error('Error loading sync queue:', error);
        }
    }

    async processSyncQueue() {
        if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        this.updateSyncStatus();

        try {
            while (this.syncQueue.length > 0 && this.isOnline) {
                const syncItem = this.syncQueue[0];
                await this.syncItem(syncItem);
                this.syncQueue.shift();
            }
        } catch (error) {
            console.error('Error processing sync queue:', error);
        } finally {
            this.syncInProgress = false;
            this.updateSyncStatus();
        }
    }

    async syncItem(syncItem) {
        try {
            syncItem.attempts++;
            syncItem.last_attempt = new Date().toISOString();
            this.syncStats.total++;

            let result;
            switch (syncItem.table) {
                case 'inventory':
                    result = await this.syncInventoryItem(syncItem);
                    break;
                case 'sales':
                    result = await this.syncSalesItem(syncItem);
                    break;
                case 'customers':
                    result = await this.syncCustomerItem(syncItem);
                    break;
                case 'suppliers':
                    result = await this.syncSupplierItem(syncItem);
                    break;
                default:
                    throw new Error(`Unknown table: ${syncItem.table}`);
            }

            // Mark as successful
            await this.markSyncSuccess(syncItem);
            this.syncStats.successful++;
            this.syncStats.pending--;

        } catch (error) {
            console.error('Sync error:', error);
            syncItem.error_message = error.message;

            if (syncItem.attempts >= this.retryAttempts) {
                // Mark as failed
                await this.markSyncFailed(syncItem);
                this.syncStats.failed++;
                this.syncStats.pending--;
            } else {
                // Retry later
                await this.scheduleRetry(syncItem);
            }
        }
    }

    async syncInventoryItem(syncItem) {
        const { action, record_id, data } = syncItem;

        switch (action) {
            case 'create':
                return await apiManager.syncInventoryItem(data);
            case 'update':
                return await apiManager.updateInventoryStock(record_id, data.stock_quantity);
            case 'delete':
                return await apiManager.deleteInventoryItem(record_id);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async syncSalesItem(syncItem) {
        const { action, record_id, data } = syncItem;

        switch (action) {
            case 'create':
                return await apiManager.syncSalesData([data]);
            case 'update':
                return await apiManager.updateSalesData(record_id, data);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async syncCustomerItem(syncItem) {
        const { action, record_id, data } = syncItem;

        switch (action) {
            case 'create':
                return await apiManager.createCustomer(data);
            case 'update':
                return await apiManager.updateCustomer(record_id, data);
            case 'delete':
                return await apiManager.deleteCustomer(record_id);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async syncSupplierItem(syncItem) {
        const { action, record_id, data } = syncItem;

        switch (action) {
            case 'create':
                return await apiManager.createSupplier(data);
            case 'update':
                return await apiManager.updateSupplier(record_id, data);
            case 'delete':
                return await apiManager.deleteSupplier(record_id);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async markSyncSuccess(syncItem) {
        await databaseManager.runQuery(
            'UPDATE sync_log SET sync_status = ?, synced_at = ? WHERE id = ?',
            ['success', new Date().toISOString(), syncItem.id]
        );
    }

    async markSyncFailed(syncItem) {
        await databaseManager.runQuery(
            'UPDATE sync_log SET sync_status = ?, error_message = ? WHERE id = ?',
            ['failed', syncItem.error_message, syncItem.id]
        );
    }

    async scheduleRetry(syncItem) {
        const delay = Math.min(
            this.retryDelay * Math.pow(2, syncItem.attempts - 1),
            this.maxRetryDelay
        );

        setTimeout(() => {
            if (this.isOnline) {
                this.processSyncQueue();
            }
        }, delay);

        await databaseManager.runQuery(
            'UPDATE sync_log SET sync_attempts = ?, last_sync_attempt = ? WHERE id = ?',
            [syncItem.attempts, syncItem.last_attempt, syncItem.id]
        );
    }

    startSyncMonitoring() {
        // Check sync status every 30 seconds
        this.syncInterval = setInterval(() => {
            this.checkSyncStatus();
        }, 30000);

        // Process queue every 10 seconds if online
        setInterval(() => {
            if (this.isOnline && !this.syncInProgress) {
                this.processSyncQueue();
            }
        }, 10000);
    }

    async checkSyncStatus() {
        try {
            const isConnected = await apiManager.testConnection();
            this.syncStatus = isConnected ? 'connected' : 'disconnected';
            this.updateSyncStatus();

            if (isConnected && this.syncQueue.length > 0) {
                this.processSyncQueue();
            }
        } catch (error) {
            this.syncStatus = 'error';
            this.updateSyncStatus();
        }
    }

    updateSyncStatus() {
        const syncStatusElement = document.getElementById('sync-status');
        if (!syncStatusElement) return;

        const syncText = syncStatusElement.querySelector('.sync-text');
        const syncIcon = syncStatusElement.querySelector('.sync-icon');

        if (syncText && syncIcon) {
            switch (this.syncStatus) {
                case 'connected':
                    syncText.textContent = 'متصل';
                    syncIcon.textContent = '🟢';
                    syncStatusElement.title = `متصل بخادم Clutch - ${this.syncStats.pending} عنصر في الانتظار`;
                    break;
                case 'disconnected':
                    syncText.textContent = 'غير متصل';
                    syncIcon.textContent = '🔴';
                    syncStatusElement.title = 'غير متصل بخادم Clutch';
                    break;
                case 'syncing':
                    syncText.textContent = 'جاري المزامنة';
                    syncIcon.textContent = '🔄';
                    syncStatusElement.title = 'جاري مزامنة البيانات مع الخادم';
                    break;
                case 'error':
                    syncText.textContent = 'خطأ في الاتصال';
                    syncIcon.textContent = '⚠️';
                    syncStatusElement.title = 'خطأ في الاتصال بخادم Clutch';
                    break;
            }
        }

        // Update sync stats in UI if available
        this.updateSyncStatsUI();
    }

    updateSyncStatsUI() {
        const statsElement = document.getElementById('sync-stats');
        if (!statsElement) return;

        statsElement.innerHTML = `
            <div class="sync-stats-item">
                <span class="sync-stats-label">إجمالي:</span>
                <span class="sync-stats-value">${this.syncStats.total}</span>
            </div>
            <div class="sync-stats-item">
                <span class="sync-stats-label">نجح:</span>
                <span class="sync-stats-value success">${this.syncStats.successful}</span>
            </div>
            <div class="sync-stats-item">
                <span class="sync-stats-label">فشل:</span>
                <span class="sync-stats-value error">${this.syncStats.failed}</span>
            </div>
            <div class="sync-stats-item">
                <span class="sync-stats-label">في الانتظار:</span>
                <span class="sync-stats-value warning">${this.syncStats.pending}</span>
            </div>
        `;
    }

    // Manual sync operations
    async forceSync() {
        if (this.syncInProgress) {
            uiManager.showNotification('المزامنة جارية بالفعل', 'warning');
            return;
        }

        try {
            this.syncStatus = 'syncing';
            this.updateSyncStatus();

            await this.processSyncQueue();

            if (this.syncQueue.length === 0) {
                uiManager.showNotification('تمت المزامنة بنجاح', 'success');
            } else {
                uiManager.showNotification(`تمت مزامنة ${this.syncStats.successful} عنصر`, 'info');
            }
        } catch (error) {
            console.error('Error in force sync:', error);
            uiManager.showNotification('خطأ في المزامنة', 'error');
        }
    }

    async clearFailedSyncs() {
        try {
            await window.databaseManager.runQuery(
                'DELETE FROM sync_log WHERE sync_status = ?',
                ['failed']
            );

            // Reload queue
            await this.loadSyncQueue();
            uiManager.showNotification('تم مسح المزامنات الفاشلة', 'success');
        } catch (error) {
            console.error('Error clearing failed syncs:', error);
            uiManager.showNotification('خطأ في مسح المزامنات الفاشلة', 'error');
        }
    }

    async retryFailedSyncs() {
        try {
            const failedItems = await databaseManager.allQuery(
                'SELECT * FROM sync_log WHERE sync_status = ?',
                ['failed']
            );

            for (const item of failedItems) {
                await window.databaseManager.runQuery(
                    'UPDATE sync_log SET sync_status = ?, sync_attempts = 0, error_message = NULL WHERE id = ?',
                    ['pending', item.id]
                );
            }

            // Reload queue
            await this.loadSyncQueue();
            uiManager.showNotification(`تم إعادة محاولة ${failedItems.length} مزامنة فاشلة`, 'success');
        } catch (error) {
            console.error('Error retrying failed syncs:', error);
            uiManager.showNotification('خطأ في إعادة المحاولة', 'error');
        }
    }

    // Sync statistics
    getSyncStats() {
        return {
            ...this.syncStats,
            isOnline: this.isOnline,
            syncStatus: this.syncStatus,
            lastSyncTime: this.lastSyncTime,
            queueLength: this.syncQueue.length
        };
    }

    // Utility methods
    generateSyncId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async getSyncHistory(limit = 100) {
        try {
            return await databaseManager.allQuery(
                'SELECT * FROM sync_log ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
        } catch (error) {
            console.error('Error getting sync history:', error);
            return [];
        }
    }

    async getSyncErrors() {
        try {
            return await databaseManager.allQuery(
                'SELECT * FROM sync_log WHERE sync_status = ? ORDER BY created_at DESC',
                ['failed']
            );
        } catch (error) {
            console.error('Error getting sync errors:', error);
            return [];
        }
    }

    async startRealTimeSync() {
        // Start real-time synchronization
        console.log('Starting real-time sync...');
        this.syncStatus = 'connected';
        this.updateSyncStatus();
        
        // Process any pending sync items
        await this.processSyncQueue();
        
        // Start periodic sync monitoring
        this.startSyncMonitoring();
        
        return true;
    }

    // Cleanup
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Export singleton instance
const syncManager = new SyncManager();
module.exports = syncManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.syncManager = syncManager;
}
