export interface SyncStatus {
    isOnline: boolean;
    lastSync: Date | null;
    pendingChanges: number;
    syncInProgress: boolean;
    errorMessage?: string;
}
export interface SyncConfig {
    backendUrl: string;
    apiKey: string;
    syncInterval: number;
    retryAttempts: number;
    retryDelay: number;
}
export declare class SyncManager {
    private db;
    private config;
    private httpClient;
    private syncInterval;
    private isOnline;
    private lastSync;
    private pendingChanges;
    private syncInProgress;
    constructor();
    initialize(): Promise<void>;
    private loadConfig;
    private checkConnection;
    private startSyncInterval;
    syncNow(): Promise<boolean>;
    private getPendingChangesCount;
    private syncPendingChanges;
    private syncChange;
    private getEndpointForTable;
    private syncFromBackend;
    private syncProductsFromBackend;
    private syncCustomersFromBackend;
    private syncSuppliersFromBackend;
    logChange(tableName: string, recordId: number, operation: 'create' | 'update' | 'delete'): Promise<void>;
    getStatus(): Promise<SyncStatus>;
    stop(): Promise<void>;
    updateConfig(newConfig: Partial<SyncConfig>): Promise<void>;
}
//# sourceMappingURL=sync.d.ts.map