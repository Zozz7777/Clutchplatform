// WebSocket Manager for Real-Time Communication with Clutch Backend
// apiManager is loaded as a script and available globally
// syncManager and uiManager are loaded as scripts and available globally

class WebSocketManager {
    constructor() {
        this.websocket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1 second
        this.maxReconnectDelay = 30000; // 30 seconds
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.messageQueue = [];
        this.eventHandlers = new Map();
        
        this.init();
    }

    init() {
        this.setupEventHandlers();
        this.connect();
    }

    setupEventHandlers() {
        // Register default event handlers
        this.on('inventory_update', this.handleInventoryUpdate.bind(this));
        this.on('price_update', this.handlePriceUpdate.bind(this));
        this.on('demand_forecast', this.handleDemandForecast.bind(this));
        this.on('market_insight', this.handleMarketInsight.bind(this));
        this.on('order_notification', this.handleOrderNotification.bind(this));
        this.on('stock_alert', this.handleStockAlert.bind(this));
        this.on('price_alert', this.handlePriceAlert.bind(this));
        this.on('system_message', this.handleSystemMessage.bind(this));
        this.on('sync_request', this.handleSyncRequest.bind(this));
        this.on('heartbeat', this.handleHeartbeat.bind(this));
    }

    connect() {
        try {
            const wsUrl = this.getWebSocketUrl();
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = this.handleOpen.bind(this);
            this.websocket.onmessage = this.handleMessage.bind(this);
            this.websocket.onclose = this.handleClose.bind(this);
            this.websocket.onerror = this.handleError.bind(this);

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    getWebSocketUrl() {
        const baseUrl = window.apiManager.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
        const shopId = window.apiManager.shopId;
        const apiKey = window.apiManager.apiKey;
        
        return `${baseUrl}/ws/shop/${shopId}?token=${apiKey}`;
    }

    handleOpen(event) {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Process queued messages
        this.processMessageQueue();
        
        // Notify UI
        this.updateConnectionStatus();
        
        // Send authentication
        this.send({
            type: 'auth',
            data: {
                shop_id: window.apiManager.shopId,
                token: window.apiManager.apiKey
            }
        });
    }

    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    handleIncomingMessage(message) {
        const { type, data, timestamp } = message;
        
        // Update last activity
        this.lastActivity = Date.now();
        
        // Handle heartbeat
        if (type === 'pong') {
            this.handleHeartbeat(data);
            return;
        }
        
        // Call registered handlers
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data, timestamp);
                } catch (error) {
                    console.error(`Error in WebSocket handler for ${type}:`, error);
                }
            });
        } else {
            console.log('Unhandled WebSocket message type:', type);
        }
    }

    handleClose(event) {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        this.updateConnectionStatus();
        
        // Schedule reconnect if not a clean close
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    }

    handleError(error) {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.updateConnectionStatus();
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 30000); // Send heartbeat every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    sendHeartbeat() {
        if (this.isConnected) {
            this.send({
                type: 'ping',
                data: {
                    timestamp: Date.now()
                }
            });
            
            // Set timeout for pong response
            this.heartbeatTimeout = setTimeout(() => {
                console.log('Heartbeat timeout, reconnecting...');
                this.websocket.close();
            }, 10000); // 10 second timeout
        }
    }

    handleHeartbeat(data) {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    send(message) {
        if (this.isConnected && this.websocket.readyState === WebSocket.OPEN) {
            try {
                this.websocket.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                this.messageQueue.push(message);
            }
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    // Event handling
    on(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType).push(handler);
    }

    off(eventType, handler) {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Message handlers
    handleInventoryUpdate(data) {
        console.log('Inventory update received:', data);
        
        // Update local inventory if needed
        if (data.action === 'update' && data.item_id) {
            this.updateLocalInventory(data.item_id, data.changes);
        }
        
        // Show notification
        uiManager.showNotification('تم تحديث المخزون', 'info');
    }

    handlePriceUpdate(data) {
        console.log('Price update received:', data);
        
        // Update local prices
        if (data.item_id) {
            this.updateLocalPrice(data.item_id, data.new_price);
        }
        
        // Show notification
        uiManager.showNotification('تم تحديث الأسعار', 'info');
    }

    handleDemandForecast(data) {
        console.log('Demand forecast received:', data);
        
        // Update demand forecast data
        this.updateDemandForecast(data);
        
        // Show notification for significant changes
        if (data.alert_level === 'high') {
            uiManager.showNotification('تنبيه: توقع ارتفاع الطلب', 'warning');
        }
    }

    handleMarketInsight(data) {
        console.log('Market insight received:', data);
        
        // Update market insights
        this.updateMarketInsights(data);
        
        // Show notification for important insights
        if (data.importance === 'high') {
            uiManager.showNotification('رؤية جديدة في السوق', 'info');
        }
    }

    handleOrderNotification(data) {
        console.log('Order notification received:', data);
        
        // Show order notification
        uiManager.showNotification(`طلب جديد: ${data.order_number}`, 'success');
        
        // Play notification sound if enabled
        this.playNotificationSound();
    }

    handleStockAlert(data) {
        console.log('Stock alert received:', data);
        
        // Show stock alert
        uiManager.showNotification(`تنبيه مخزون: ${data.item_name}`, 'warning');
        
        // Update stock alert in UI
        this.updateStockAlert(data);
    }

    handlePriceAlert(data) {
        console.log('Price alert received:', data);
        
        // Show price alert
        uiManager.showNotification(`تنبيه سعر: ${data.item_name}`, 'info');
        
        // Update price alert in UI
        this.updatePriceAlert(data);
    }

    handleSystemMessage(data) {
        console.log('System message received:', data);
        
        // Show system message
        uiManager.showNotification(data.message, data.type || 'info');
    }

    handleSyncRequest(data) {
        console.log('Sync request received:', data);
        
        // Trigger sync
        syncManager.forceSync();
    }

    // Local data updates
    async updateLocalInventory(itemId, changes) {
        try {
            const databaseManager = require('./simple-database');
            await databaseManager.runQuery(
                'UPDATE inventory SET ? WHERE id = ?',
                [changes, itemId]
            );
        } catch (error) {
            console.error('Error updating local inventory:', error);
        }
    }

    async updateLocalPrice(itemId, newPrice) {
        try {
            const databaseManager = require('./simple-database');
            await databaseManager.runQuery(
                'UPDATE inventory SET unit_price = ? WHERE id = ?',
                [newPrice, itemId]
            );
        } catch (error) {
            console.error('Error updating local price:', error);
        }
    }

    updateDemandForecast(data) {
        // Store demand forecast data
        localStorage.setItem('demand_forecast', JSON.stringify(data));
    }

    updateMarketInsights(data) {
        // Store market insights
        const insights = JSON.parse(localStorage.getItem('market_insights') || '[]');
        insights.unshift(data);
        insights.splice(10); // Keep only last 10 insights
        localStorage.setItem('market_insights', JSON.stringify(insights));
    }

    updateStockAlert(data) {
        // Update stock alert in UI
        const alertElement = document.getElementById('stock-alerts');
        if (alertElement) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'stock-alert';
            alertDiv.innerHTML = `
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <div class="alert-title">${data.item_name}</div>
                    <div class="alert-message">المخزون: ${data.current_stock} - الحد الأدنى: ${data.min_stock}</div>
                </div>
            `;
            alertElement.appendChild(alertDiv);
        }
    }

    updatePriceAlert(data) {
        // Update price alert in UI
        const alertElement = document.getElementById('price-alerts');
        if (alertElement) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'price-alert';
            alertDiv.innerHTML = `
                <div class="alert-icon">💰</div>
                <div class="alert-content">
                    <div class="alert-title">${data.item_name}</div>
                    <div class="alert-message">السعر الجديد: ${data.new_price}</div>
                </div>
            `;
            alertElement.appendChild(alertDiv);
        }
    }

    playNotificationSound() {
        // Play notification sound if enabled
        const soundEnabled = localStorage.getItem('notification_sound') === 'true';
        if (soundEnabled) {
            const audio = new Audio('assets/notification.mp3');
            audio.play().catch(error => {
                console.log('Could not play notification sound:', error);
            });
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('websocket-status');
        if (!statusElement) return;

        if (this.isConnected) {
            statusElement.textContent = 'متصل';
            statusElement.className = 'status-connected';
        } else {
            statusElement.textContent = 'غير متصل';
            statusElement.className = 'status-disconnected';
        }
    }

    // Public methods
    subscribe(eventType, handler) {
        this.on(eventType, handler);
    }

    unsubscribe(eventType, handler) {
        this.off(eventType, handler);
    }

    publish(eventType, data) {
        this.send({
            type: eventType,
            data: data,
            timestamp: Date.now()
        });
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            lastActivity: this.lastActivity
        };
    }

    // Cleanup
    disconnect() {
        this.stopHeartbeat();
        if (this.websocket) {
            this.websocket.close(1000, 'Manual disconnect');
        }
    }

    destroy() {
        this.disconnect();
        this.eventHandlers.clear();
        this.messageQueue = [];
    }
}

// Export singleton instance
const websocketManager = new WebSocketManager();
module.exports = websocketManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.websocketManager = websocketManager;
}
