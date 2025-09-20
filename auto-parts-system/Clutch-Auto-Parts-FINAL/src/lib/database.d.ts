import * as sqlite3 from 'sqlite3';
export interface DatabaseConfig {
    filename: string;
    mode: number;
}
export declare class DatabaseManager {
    private db;
    private config;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    private insertDefaultData;
    query(sql: string, params?: any[]): Promise<any[]>;
    exec(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
    get(sql: string, params?: any[]): Promise<any>;
    close(): Promise<void>;
    backup(backupPath: string): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map