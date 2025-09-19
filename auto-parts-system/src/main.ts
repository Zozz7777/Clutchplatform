import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { isDev } from './lib/utils';
import { DatabaseManager } from './lib/database';
import { SyncManager } from './lib/sync-manager';
import { WebSocketManager } from './lib/websocket';
import { I18nManager } from './lib/i18n';
import { AuthManager } from './lib/auth';
import { logger } from './lib/logger';

class ClutchAutoPartsApp {
  private mainWindow: BrowserWindow | null = null;
  private databaseManager: DatabaseManager;
  private syncManager: SyncManager;
  private websocketManager: WebSocketManager;
  private i18nManager: I18nManager;
  private authManager: AuthManager;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.syncManager = new SyncManager();
    this.websocketManager = new WebSocketManager();
    this.i18nManager = new I18nManager();
    this.authManager = new AuthManager();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize core services
      await this.databaseManager.initialize();
      await this.i18nManager.initialize();
      await this.authManager.initialize();
      
      // Wait a moment for database to be fully ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize sync and websocket after auth
      await this.syncManager.initialize();
      await this.websocketManager.initialize();

      logger.info('Clutch Auto Parts System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize system:', error);
      throw error;
    }
  }

  createWindow(): void {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 768,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !isDev()
      },
      icon: path.join(__dirname, '../assets/icon.png'),
      titleBarStyle: 'default',
      show: false
    });

    // Load the app
    if (isDev()) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
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

  setupMenu(): void {
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
            label: 'Import Data',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              this.mainWindow?.webContents.send('menu-import-data');
            }
          },
          {
            label: 'Export Data',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('menu-export-data');
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
            label: 'About Clutch Auto Parts',
            click: () => {
              dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'About',
                message: 'Clutch Auto Parts System',
                detail: 'Version 1.0.0\nOffline-first, Arabic-first, AI-powered shop management solution'
              });
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC(): void {
    // Database operations
    ipcMain.handle('db-query', async (event, query: string, params: any[]) => {
      return await this.databaseManager.query(query, params);
    });

    ipcMain.handle('db-exec', async (event, query: string, params: any[]) => {
      return await this.databaseManager.exec(query, params);
    });

    // Sync operations
    ipcMain.handle('sync-now', async () => {
      return await this.syncManager.syncNow();
    });

    ipcMain.handle('sync-status', async () => {
      return await this.syncManager.getStatus();
    });

    // Auth operations
    ipcMain.handle('auth-login', async (event, credentials: { username: string; password: string }) => {
      return await this.authManager.login(credentials.username, credentials.password);
    });

    ipcMain.handle('auth-logout', async () => {
      return await this.authManager.logout();
    });

    ipcMain.handle('auth-get-user', async () => {
      return await this.authManager.getCurrentUser();
    });

    // File operations
    ipcMain.handle('file-import', async (event, filePath: string) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters: [
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      return result;
    });

    ipcMain.handle('file-export', async (event, data: any, filename: string) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        defaultPath: filename,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });
      return result;
    });

    // System operations
    ipcMain.handle('system-info', async () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: app.getVersion(),
        electron: process.versions.electron,
        node: process.versions.node
      };
    });
  }

  async run(): Promise<void> {
    try {
      await this.initialize();
      this.createWindow();
      this.setupMenu();
      this.setupIPC();

      // Handle app events
      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      });

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });

      app.on('before-quit', async () => {
        await this.cleanup();
      });

    } catch (error) {
      logger.error('Failed to run application:', error);
      app.quit();
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await this.websocketManager.disconnect();
      await this.syncManager.stop();
      await this.databaseManager.close();
      logger.info('Application cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }
}

// Initialize and run the app
const clutchApp = new ClutchAutoPartsApp();

app.whenReady().then(() => {
  clutchApp.run().catch((error) => {
    logger.error('Application startup failed:', error);
    app.quit();
  });
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
