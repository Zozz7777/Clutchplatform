import express from 'express';
import * as multer from 'multer';
import * as path from 'path';
import { DatabaseManager } from '../../lib/database';
import { AuthManager } from '../../lib/auth';
import { BackupManager } from '../../lib/backup-manager';
import { logger } from '../../lib/logger';
import { User } from '../../types';

const router = express.Router();
const databaseManager = new DatabaseManager();
const authManager = new AuthManager();
const backupManager = new BackupManager();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.json', '.csv', '.gz'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, CSV, and GZ files are allowed.'));
    }
  }
});

// Middleware to check authentication
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const currentUser = await authManager.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }
    req.user = currentUser as User;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
      timestamp: new Date().toISOString()
    });
  }
};

// GET /api/backup - Get all backups
router.get('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view backups.',
        timestamp: new Date().toISOString()
      });
    }

    const backups = await backupManager.getBackups();

    res.json({
      success: true,
      data: backups,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get backups error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BACKUPS_FAILED',
      message: 'Failed to get backups',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/backup/stats - Get backup statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view backup statistics.',
        timestamp: new Date().toISOString()
      });
    }

    const stats = await backupManager.getBackupStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get backup stats error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BACKUP_STATS_FAILED',
      message: 'Failed to get backup statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/backup/:id - Get backup information
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.view')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view backup information.',
        timestamp: new Date().toISOString()
      });
    }

    const backupId = req.params.id;
    const backup = await backupManager.getBackupInfo(backupId);

    if (!backup) {
      return res.status(404).json({
        success: false,
        error: 'BACKUP_NOT_FOUND',
        message: 'Backup not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: backup,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get backup info error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_BACKUP_INFO_FAILED',
      message: 'Failed to get backup information',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/backup - Create new backup
router.post('/', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.create')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to create backups.',
        timestamp: new Date().toISOString()
      });
    }

    const { name, type = 'manual', description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Backup name is required',
        timestamp: new Date().toISOString()
      });
    }

    const validTypes = ['full', 'incremental', 'manual'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BACKUP_TYPE',
        message: `Backup type must be one of: ${validTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const backup = await backupManager.createBackup(name, type, description);

    res.status(201).json({
      success: true,
      data: backup,
      message: 'Backup created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_BACKUP_FAILED',
      message: 'Failed to create backup',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/backup/:id/restore - Restore from backup
router.post('/:id/restore', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.restore')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to restore backups.',
        timestamp: new Date().toISOString()
      });
    }

    const backupId = req.params.id;
    const { skip_errors = false } = req.body;

    const result = await backupManager.restoreBackup(backupId, { skip_errors });

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Backup restored successfully' : 'Backup restore completed with errors',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Restore backup error:', error);
    res.status(500).json({
      success: false,
      error: 'RESTORE_BACKUP_FAILED',
      message: 'Failed to restore backup',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/backup/:id - Delete backup
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.delete')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to delete backups.',
        timestamp: new Date().toISOString()
      });
    }

    const backupId = req.params.id;
    const success = await backupManager.deleteBackup(backupId);

    res.json({
      success,
      message: success ? 'Backup deleted successfully' : 'Failed to delete backup',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_BACKUP_FAILED',
      message: 'Failed to delete backup',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/backup/export - Export data
router.post('/export', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.export')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to export data.',
        timestamp: new Date().toISOString()
      });
    }

    const { format = 'json', tables, include_media = false, compress = false } = req.body;

    const validFormats = ['json', 'csv', 'excel'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EXPORT_FORMAT',
        message: `Export format must be one of: ${validFormats.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const filePath = await backupManager.exportData({
      format,
      tables,
      include_media,
      compress
    });

    res.json({
      success: true,
      data: {
        file_path: filePath,
        format,
        compress
      },
      message: 'Data exported successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_DATA_FAILED',
      message: 'Failed to export data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/backup/import - Import data
router.post('/import', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.import')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to import data.',
        timestamp: new Date().toISOString()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE_UPLOADED',
        message: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    const { format = 'json', merge_mode = 'replace', validate_data = true } = req.body;

    const validFormats = ['json', 'csv', 'excel'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_IMPORT_FORMAT',
        message: `Import format must be one of: ${validFormats.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const validMergeModes = ['replace', 'merge', 'skip_existing'];
    if (!validMergeModes.includes(merge_mode)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MERGE_MODE',
        message: `Merge mode must be one of: ${validMergeModes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    const result = await backupManager.importData(req.file.path, {
      format,
      merge_mode,
      validate_data
    });

    // Clean up uploaded file
    try {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      logger.warn('Failed to clean up uploaded file:', cleanupError);
    }

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Data imported successfully' : 'Data import completed with errors',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Import data error:', error);
    res.status(500).json({
      success: false,
      error: 'IMPORT_DATA_FAILED',
      message: 'Failed to import data',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/backup/:id/download - Download backup file
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser || !authManager.hasPermission(currentUser, 'backup.download')) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to download backups.',
        timestamp: new Date().toISOString()
      });
    }

    const backupId = req.params.id;
    const backup = await backupManager.getBackupInfo(backupId);

    if (!backup) {
      return res.status(404).json({
        success: false,
        error: 'BACKUP_NOT_FOUND',
        message: 'Backup not found',
        timestamp: new Date().toISOString()
      });
    }

    const fs = require('fs');
    const path = require('path');
    const backupFileName = `${backupId}.json.gz`;
    const backupFilePath = path.join(process.cwd(), 'data', 'backups', backupFileName);

    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'BACKUP_FILE_NOT_FOUND',
        message: 'Backup file not found',
        timestamp: new Date().toISOString()
      });
    }

    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.name}.json.gz"`);
    res.sendFile(backupFilePath);

  } catch (error) {
    logger.error('Download backup error:', error);
    res.status(500).json({
      success: false,
      error: 'DOWNLOAD_BACKUP_FAILED',
      message: 'Failed to download backup',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
