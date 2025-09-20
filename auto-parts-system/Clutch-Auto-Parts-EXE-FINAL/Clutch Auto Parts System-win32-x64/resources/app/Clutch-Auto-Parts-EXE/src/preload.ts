import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  dbQuery: (query: string, params: any[]) => ipcRenderer.invoke('db-query', query, params),
  dbExec: (query: string, params: any[]) => ipcRenderer.invoke('db-exec', query, params),

  // Sync operations
  syncNow: () => ipcRenderer.invoke('sync-now'),
  getSyncStatus: () => ipcRenderer.invoke('sync-status'),

  // Auth operations
  login: (credentials: { username: string; password: string }) => 
    ipcRenderer.invoke('auth-login', credentials),
  logout: () => ipcRenderer.invoke('auth-logout'),
  getCurrentUser: () => ipcRenderer.invoke('auth-get-user'),

  // File operations
  importFile: (filePath: string) => ipcRenderer.invoke('file-import', filePath),
  exportFile: (data: any, filename: string) => ipcRenderer.invoke('file-export', data, filename),

  // System operations
  getSystemInfo: () => ipcRenderer.invoke('system-info'),

  // Menu events
  onMenuNewSale: (callback: () => void) => {
    ipcRenderer.on('menu-new-sale', callback);
    return () => ipcRenderer.removeListener('menu-new-sale', callback);
  },
  onMenuImportData: (callback: () => void) => {
    ipcRenderer.on('menu-import-data', callback);
    return () => ipcRenderer.removeListener('menu-import-data', callback);
  },
  onMenuExportData: (callback: () => void) => {
    ipcRenderer.on('menu-export-data', callback);
    return () => ipcRenderer.removeListener('menu-export-data', callback);
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      dbQuery: (query: string, params: any[]) => Promise<any>;
      dbExec: (query: string, params: any[]) => Promise<any>;
      syncNow: () => Promise<any>;
      getSyncStatus: () => Promise<any>;
      login: (credentials: { username: string; password: string }) => Promise<any>;
      logout: () => Promise<any>;
      getCurrentUser: () => Promise<any>;
      importFile: (filePath: string) => Promise<any>;
      exportFile: (data: any, filename: string) => Promise<any>;
      getSystemInfo: () => Promise<any>;
      onMenuNewSale: (callback: () => void) => () => void;
      onMenuImportData: (callback: () => void) => () => void;
      onMenuExportData: (callback: () => void) => () => void;
    };
  }
}
