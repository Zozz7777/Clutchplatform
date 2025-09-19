"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
const logger_1 = require("./logger");
class WebSocketManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.config = {
            url: 'wss://clutch-main-nk7x.onrender.com/ws',
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000
        };
    }
    async initialize() {
        try {
            await this.connect();
            logger_1.logger.info('WebSocket manager initialized');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize WebSocket manager:', error);
        }
    }
    async connect() {
        if (this.isConnecting || this.isConnected) {
            return;
        }
        this.isConnecting = true;
        try {
            this.ws = new ws_1.default(this.config.url);
            this.ws.on('open', () => {
                this.isConnected = true;
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                logger_1.logger.info('WebSocket connected successfully');
                this.emit('connected');
                // Start heartbeat
                this.startHeartbeat();
            });
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(message);
                }
                catch (error) {
                    logger_1.logger.error('Failed to parse WebSocket message:', error);
                }
            });
            this.ws.on('close', (code, reason) => {
                this.isConnected = false;
                this.isConnecting = false;
                logger_1.logger.warn(`WebSocket closed: ${code} - ${reason}`);
                this.emit('disconnected', { code, reason });
                // Stop heartbeat
                this.stopHeartbeat();
                // Attempt to reconnect
                this.scheduleReconnect();
            });
            this.ws.on('error', (error) => {
                this.isConnected = false;
                this.isConnecting = false;
                logger_1.logger.error('WebSocket error:', error);
                this.emit('error', error);
            });
        }
        catch (error) {
            this.isConnecting = false;
            logger_1.logger.error('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }
    handleMessage(message) {
        logger_1.logger.debug('Received WebSocket message:', message);
        switch (message.type) {
            case 'sync_required':
                this.emit('syncRequired', message.data);
                break;
            case 'inventory_update':
                this.emit('inventoryUpdate', message.data);
                break;
            case 'price_update':
                this.emit('priceUpdate', message.data);
                break;
            case 'stock_alert':
                this.emit('stockAlert', message.data);
                break;
            case 'system_notification':
                this.emit('systemNotification', message.data);
                break;
            case 'pong':
                // Heartbeat response
                break;
            default:
                logger_1.logger.warn('Unknown WebSocket message type:', message.type);
                this.emit('unknownMessage', message);
        }
    }
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected && this.ws) {
                this.send({
                    type: 'ping',
                    data: { timestamp: Date.now() },
                    timestamp: Date.now()
                });
            }
        }, this.config.heartbeatInterval);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            logger_1.logger.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.reconnectAttempts++;
        const delay = this.config.reconnectInterval * this.reconnectAttempts;
        logger_1.logger.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }
    send(message) {
        if (!this.isConnected || !this.ws) {
            logger_1.logger.warn('Cannot send message: WebSocket not connected');
            return false;
        }
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to send WebSocket message:', error);
            return false;
        }
    }
    sendSyncRequest(tableName, recordId) {
        return this.send({
            type: 'sync_request',
            data: { tableName, recordId },
            timestamp: Date.now()
        });
    }
    sendInventoryUpdate(productId, stockChange) {
        return this.send({
            type: 'inventory_update',
            data: { productId, stockChange },
            timestamp: Date.now()
        });
    }
    sendSaleNotification(saleId, total) {
        return this.send({
            type: 'sale_notification',
            data: { saleId, total },
            timestamp: Date.now()
        });
    }
    sendStockAlert(productId, currentStock, minStock) {
        return this.send({
            type: 'stock_alert',
            data: { productId, currentStock, minStock },
            timestamp: Date.now()
        });
    }
    async disconnect() {
        this.stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.isConnecting = false;
        logger_1.logger.info('WebSocket disconnected');
    }
    isWebSocketConnected() {
        return this.isConnected;
    }
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            connecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger_1.logger.info('WebSocket configuration updated');
    }
}
exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=websocket.js.map