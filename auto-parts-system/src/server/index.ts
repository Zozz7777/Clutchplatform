import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { DatabaseManager } from '../lib/database';
import { AuthManager } from '../lib/auth';
import { SyncManager } from '../lib/sync-manager';
import { WebSocketManager } from '../lib/websocket-manager';
import { logger, morganStream } from '../lib/logger';
import { isDev } from '../lib/utils';

// Import route handlers
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import salesRoutes from './routes/sales';
import customersRoutes from './routes/customers';
import suppliersRoutes from './routes/suppliers';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import syncRoutes from './routes/sync';
import aiRoutes from './routes/ai';
import marketplaceRoutes from './routes/marketplace';
import branchesRoutes from './routes/branches';
import backupRoutes from './routes/backup';
import companionRoutes from './routes/companion';
import trainingRoutes from './routes/training';
import rbacRoutes from './routes/rbac';
import websocketRoutes, { setWebSocketManager } from './routes/websocket';
import dashboardRoutes from './routes/dashboard';

class ClutchAutoPartsServer {
  private app: express.Application;
  private server: any;
  private databaseManager: DatabaseManager;
  private authManager: AuthManager;
  private syncManager: SyncManager;
  private websocketManager: WebSocketManager;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000');
    this.databaseManager = new DatabaseManager();
    this.authManager = new AuthManager();
    this.syncManager = new SyncManager();
    this.websocketManager = new WebSocketManager(this.databaseManager, this.authManager);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize core services
      await this.databaseManager.initialize();
      await this.authManager.initialize();
      await this.syncManager.initialize();
      // Set WebSocket manager for routes
      setWebSocketManager(this.websocketManager);

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for Electron
      crossOriginEmbedderPolicy: false
    }));

    // CORS middleware
    this.app.use(cors({
      origin: isDev() ? ['http://localhost:3000', 'http://localhost:8080'] : false,
      credentials: true
    }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined', { stream: morganStream }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files (for development)
    if (isDev()) {
      this.app.use(express.static('src/renderer'));
    }

    // Request logging
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env['npm_package_version'] || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/inventory', inventoryRoutes);
    this.app.use('/api/sales', salesRoutes);
    this.app.use('/api/customers', customersRoutes);
    this.app.use('/api/suppliers', suppliersRoutes);
    this.app.use('/api/reports', reportsRoutes);
    this.app.use('/api/settings', settingsRoutes);
    this.app.use('/api/sync', syncRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/marketplace', marketplaceRoutes);
    this.app.use('/api/branches', branchesRoutes);
    this.app.use('/api/backup', backupRoutes);
    this.app.use('/api/companion', companionRoutes);
    this.app.use('/api/training', trainingRoutes);
    this.app.use('/api/rbac', rbacRoutes);
    this.app.use('/api/websocket', websocketRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);

    // Serve main app (for development)
    if (isDev()) {
      this.app.get('*', (req, res) => {
        res.sendFile('index.html', { root: 'src/renderer' });
      });
    }

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', error);

      res.status(error.status || 500).json({
        success: false,
        error: error.name || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        ...(isDev() && { stack: error.stack })
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  async start(): Promise<void> {
    try {
      await this.initialize();

      this.server = this.app.listen(this.port, () => {
        logger.info(`Clutch Auto Parts Server running on port ${this.port}`);
        logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        
        // Initialize WebSocket server after HTTP server starts
        this.websocketManager.initialize(this.server);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Received shutdown signal, closing server gracefully...');

    try {
      // Stop accepting new connections
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // Close WebSocket connections
      this.websocketManager.close();

      // Stop sync manager
      await this.syncManager.stop();

      // Close database connection
      await this.databaseManager.close();

      logger.info('Server shutdown completed');
      process.exit(0);

    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  getApp(): express.Application {
    return this.app;
  }

  getServer(): any {
    return this.server;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new ClutchAutoPartsServer();
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default ClutchAutoPartsServer;
