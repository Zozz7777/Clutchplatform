import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { LocalServer } from './local-server';
import { DatabaseManager } from './database';
import { SyncManager } from './sync-manager';
import { NotificationManager } from './notification-manager';
import { RevenueSyncService } from '../src/services/revenue-sync';

class ClutchPartnersApp {
  private mainWindow: BrowserWindow | null = null;
  private localServer: LocalServer;
  private database: DatabaseManager;
  private syncManager: SyncManager;
  private notificationManager: NotificationManager;
  private revenueSyncService: RevenueSyncService;

  constructor() {
    this.localServer = new LocalServer();
    this.database = new DatabaseManager();
    this.syncManager = new SyncManager();
    this.notificationManager = new NotificationManager();
    this.revenueSyncService = new RevenueSyncService();
  }

  async initialize() {
    // Initialize database
    await this.database.initialize();
    
    // Initialize local server
    await this.localServer.start();
    
    // Initialize sync manager
    await this.syncManager.initialize();
    
    // Initialize notification manager
    await this.notificationManager.initialize();
    
    // Initialize revenue sync service
    await this.revenueSyncService.createRevenueTables();
    await this.revenueSyncService.initialize();
  }

  createWindow() {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      icon: path.join(__dirname, '../assets/icons/app-icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'default',
      show: false
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  createMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Sale',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-new-sale');
            }
          },
          {
            label: 'Open Inventory',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              this.mainWindow?.webContents.send('menu-open-inventory');
            }
          },
          { type: 'separator' },
          {
            label: 'Sync Data',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('menu-sync-data');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Clutch Partners System',
            click: () => {
              dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'About',
                message: 'Clutch Partners System',
                detail: 'Production-ready POS and Inventory Management System\nVersion 1.0.0'
              });
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // Database operations
    ipcMain.handle('db-query', async (event, query, params) => {
      return await this.database.query(query, params);
    });

    ipcMain.handle('db-exec', async (event, query, params) => {
      return await this.database.exec(query, params);
    });

    // Sync operations
    ipcMain.handle('sync-push', async (event, operations) => {
      return await this.syncManager.pushOperations(operations);
    });

    ipcMain.handle('sync-pull', async (event, since) => {
      return await this.syncManager.pullChanges(since);
    });

    ipcMain.handle('sync-status', async () => {
      return await this.syncManager.getStatus();
    });

    // Notification operations
    ipcMain.handle('notification-show', async (event, notification) => {
      return await this.notificationManager.show(notification);
    });

    // File operations
    ipcMain.handle('file-select', async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options);
      return result;
    });

    ipcMain.handle('file-save', async (event, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    // Print operations
    ipcMain.handle('print-receipt', async (event, data) => {
      // Implement receipt printing
      return { success: true };
    });

    ipcMain.handle('print-barcode', async (event, data) => {
      // Implement barcode printing
      return { success: true };
    });

    // Revenue sync operations
    ipcMain.handle('revenue-generate-daily', async (event, date) => {
      return await this.revenueSyncService.generateDailyRevenue(date);
    });

    ipcMain.handle('revenue-get-report', async (event, startDate, endDate) => {
      return await this.revenueSyncService.getRevenueReport(startDate, endDate);
    });

    ipcMain.handle('revenue-sync-pending', async () => {
      return await this.revenueSyncService.syncPendingRevenue();
    });

    // App info
    ipcMain.handle('app-info', () => {
      return {
        version: app.getVersion(),
        name: app.getName(),
        platform: process.platform,
        arch: process.arch
      };
    });
  }

  async run() {
    // Wait for app to be ready
    await app.whenReady();

    // Initialize services
    await this.initialize();

    // Create window and menu
    this.createWindow();
    this.createMenu();

    // Setup IPC handlers
    this.setupIPC();

    // Handle app activation (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    // Handle window-all-closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle before-quit
    app.on('before-quit', async () => {
      await this.cleanup();
    });
  }

  async cleanup() {
    // Stop services
    await this.syncManager.stop();
    await this.localServer.stop();
    await this.database.close();
  }
}

// Create and run the app
const clutchApp = new ClutchPartnersApp();
clutchApp.run().catch(console.error);
