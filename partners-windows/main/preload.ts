import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  dbQuery: (query: string, params?: any[]) => ipcRenderer.invoke('db-query', query, params),
  dbExec: (query: string, params?: any[]) => ipcRenderer.invoke('db-exec', query, params),

  // Sync operations
  syncPush: (operations: any[]) => ipcRenderer.invoke('sync-push', operations),
  syncPull: (since?: string) => ipcRenderer.invoke('sync-pull', since),
  syncStatus: () => ipcRenderer.invoke('sync-status'),

  // Notification operations
  showNotification: (notification: any) => ipcRenderer.invoke('notification-show', notification),

  // File operations
  selectFile: (options: any) => ipcRenderer.invoke('file-select', options),
  saveFile: (options: any) => ipcRenderer.invoke('file-save', options),

  // Print operations
  printReceipt: (data: any) => ipcRenderer.invoke('print-receipt', data),
  printBarcode: (data: any) => ipcRenderer.invoke('print-barcode', data),

  // Revenue sync operations
  revenueGenerateDaily: (date: string) => ipcRenderer.invoke('revenue-generate-daily', date),
  revenueGetReport: (startDate: string, endDate: string) => ipcRenderer.invoke('revenue-get-report', startDate, endDate),
  revenueSyncPending: () => ipcRenderer.invoke('revenue-sync-pending'),

  // App info
  getAppInfo: () => ipcRenderer.invoke('app-info'),

  // Menu events
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-new-sale', () => callback('new-sale'));
    ipcRenderer.on('menu-open-inventory', () => callback('open-inventory'));
    ipcRenderer.on('menu-sync-data', () => callback('sync-data'));
  },

  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      dbQuery: (query: string, params?: any[]) => Promise<any>;
      dbExec: (query: string, params?: any[]) => Promise<any>;
      syncPush: (operations: any[]) => Promise<any>;
      syncPull: (since?: string) => Promise<any>;
      syncStatus: () => Promise<any>;
      showNotification: (notification: any) => Promise<any>;
      selectFile: (options: any) => Promise<any>;
      saveFile: (options: any) => Promise<any>;
      printReceipt: (data: any) => Promise<any>;
      printBarcode: (data: any) => Promise<any>;
      revenueGenerateDaily: (date: string) => Promise<any>;
      revenueGetReport: (startDate: string, endDate: string) => Promise<any>;
      revenueSyncPending: () => Promise<any>;
      getAppInfo: () => Promise<any>;
      onMenuAction: (callback: (action: string) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
