import { EventEmitter } from 'events';
export interface WebSocketConfig {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
}
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
}
export declare class WebSocketManager extends EventEmitter {
    private ws;
    private config;
    private reconnectAttempts;
    private reconnectTimer;
    private heartbeatTimer;
    private isConnected;
    private isConnecting;
    constructor();
    initialize(): Promise<void>;
    private connect;
    private handleMessage;
    private startHeartbeat;
    private stopHeartbeat;
    private scheduleReconnect;
    send(message: WebSocketMessage): boolean;
    sendSyncRequest(tableName: string, recordId: number): boolean;
    sendInventoryUpdate(productId: number, stockChange: number): boolean;
    sendSaleNotification(saleId: number, total: number): boolean;
    sendStockAlert(productId: number, currentStock: number, minStock: number): boolean;
    disconnect(): Promise<void>;
    isWebSocketConnected(): boolean;
    getConnectionStatus(): {
        connected: boolean;
        connecting: boolean;
        reconnectAttempts: number;
    };
    updateConfig(newConfig: Partial<WebSocketConfig>): void;
}
//# sourceMappingURL=websocket.d.ts.map