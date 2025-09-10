const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const dbService = require('./databaseService');
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const archiver = require('archiver');
const cron = require('node-cron');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.s3Bucket = process.env.AWS_S3_BACKUP_BUCKET;
        this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
        this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 10;
        
        // Initialize AWS S3 if configured
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            this.s3 = new S3Client({
                region: process.env.AWS_REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });
        }

        this.ensureBackupDirectory();
        this.scheduleBackups();
    }

    /**
     * Ensure backup directory exists
     */
    async ensureBackupDirectory() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            console.log('Backup directory ensured');
        } catch (error) {
            console.error('Error creating backup directory:', error);
        }
    }

    /**
     * Schedule automated backups
     */
    scheduleBackups() {
        // Daily backup at 2 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('Starting scheduled daily backup...');
            await this.createFullBackup();
        });

        // Weekly backup on Sunday at 3 AM
        cron.schedule('0 3 * * 0', async () => {
            console.log('Starting scheduled weekly backup...');
            await this.createFullBackup('weekly');
        });

        // Monthly backup on 1st of month at 4 AM
        cron.schedule('0 4 1 * *', async () => {
            console.log('Starting scheduled monthly backup...');
            await this.createFullBackup('monthly');
        });

        console.log('Backup schedules configured');
    }

    /**
     * Create full system backup
     */
    async createFullBackup(type = 'daily') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `clutch-backup-${type}-${timestamp}`;
        const backupPath = path.join(this.backupDir, backupName);

        try {
            console.log(`Creating ${type} backup: ${backupName}`);

            // Create backup directory
            await fs.mkdir(backupPath, { recursive: true });

            // Database backup
            await this.backupDatabase(backupPath);

            // Configuration backup
            await this.backupConfiguration(backupPath);

            // File uploads backup
            await this.backupUploads(backupPath);

            // Logs backup
            await this.backupLogs(backupPath);

            // Create compressed archive
            const archivePath = await this.createArchive(backupPath, backupName);

            // Upload to S3 if configured
            if (this.s3) {
                await this.uploadToS3(archivePath, backupName);
            }

            // Cleanup old backups
            await this.cleanupOldBackups();

            console.log(`${type} backup completed successfully: ${backupName}`);
            return { success: true, backupName, archivePath };
        } catch (error) {
            console.error(`Backup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Backup MongoDB database
     */
    async backupDatabase(backupPath) {
        const dbPath = path.join(backupPath, 'database');
        await fs.mkdir(dbPath, { recursive: true });

        try {
            const collections = await dbService.getDB().listCollections().toArray();
            
            for (const collection of collections) {
                const collectionName = collection.name;
                const data = await dbService.getCollection(collectionName).find({}).toArray();
                
                const filePath = path.join(dbPath, `${collectionName}.json`);
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                
                console.log(`Backed up collection: ${collectionName}`);
            }

            // Create database metadata
            const metadata = {
                timestamp: new Date().toISOString(),
                collections: collections.map(c => c.name),
                totalCollections: collections.length
            };

            await fs.writeFile(
                path.join(dbPath, 'metadata.json'),
                JSON.stringify(metadata, null, 2)
            );

        } catch (error) {
            console.error('Database backup error:', error);
            throw error;
        }
    }

    /**
     * Backup configuration files
     */
    async backupConfiguration(backupPath) {
        const configPath = path.join(backupPath, 'config');
        await fs.mkdir(configPath, { recursive: true });

        const configFiles = [
            '.env',
            'package.json',
            'package-lock.json',
            'render.yaml'
        ];

        for (const file of configFiles) {
            try {
                const sourcePath = path.join(__dirname, '..', file);
                const destPath = path.join(configPath, file);
                
                await fs.copyFile(sourcePath, destPath);
                console.log(`Backed up config: ${file}`);
            } catch (error) {
                console.warn(`Could not backup ${file}: ${error.message}`);
            }
        }

        // Backup config directory
        try {
            const sourceConfigDir = path.join(__dirname, '../config');
            const destConfigDir = path.join(configPath, 'config');
            
            await this.copyDirectory(sourceConfigDir, destConfigDir);
            console.log('Backed up config directory');
        } catch (error) {
            console.warn(`Could not backup config directory: ${error.message}`);
        }
    }

    /**
     * Backup file uploads
     */
    async backupUploads(backupPath) {
        const uploadsPath = path.join(backupPath, 'uploads');
        const sourceUploadsDir = path.join(__dirname, '../uploads');

        try {
            await this.copyDirectory(sourceUploadsDir, uploadsPath);
            console.log('Backed up uploads directory');
        } catch (error) {
            console.warn(`Could not backup uploads: ${error.message}`);
        }
    }

    /**
     * Backup logs
     */
    async backupLogs(backupPath) {
        const logsPath = path.join(backupPath, 'logs');
        const sourceLogsDir = path.join(__dirname, '../logs');

        try {
            await this.copyDirectory(sourceLogsDir, logsPath);
            console.log('Backed up logs directory');
        } catch (error) {
            console.warn(`Could not backup logs: ${error.message}`);
        }
    }

    /**
     * Create compressed archive
     */
    async createArchive(backupPath, backupName) {
        return new Promise((resolve, reject) => {
            const archivePath = path.join(this.backupDir, `${backupName}.zip`);
            const output = require('fs').createWriteStream(archivePath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                console.log(`Archive created: ${archivePath}`);
                resolve(archivePath);
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(backupPath, false);
            archive.finalize();
        });
    }

    /**
     * Upload backup to S3
     */
    async uploadToS3(archivePath, backupName) {
        try {
            const fileContent = await fs.readFile(archivePath);
            
            const params = {
                Bucket: this.s3Bucket,
                Key: `backups/${backupName}.zip`,
                Body: fileContent,
                ContentType: 'application/zip',
                Metadata: {
                    'backup-type': backupName.split('-')[2],
                    'created-at': new Date().toISOString()
                }
            };

            await this.s3.send(new PutObjectCommand(params));
            console.log(`Backup uploaded to S3: ${backupName}`);
        } catch (error) {
            console.error('S3 upload error:', error);
            throw error;
        }
    }

    /**
     * Cleanup old backups
     */
    async cleanupOldBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.endsWith('.zip'));

            // Sort by creation time (oldest first)
            const fileStats = await Promise.all(
                backupFiles.map(async (file) => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = await fs.stat(filePath);
                    return { file, filePath, stats };
                })
            );

            fileStats.sort((a, b) => a.stats.birthtime - b.stats.birthtime);

            // Remove old backups beyond retention limit
            const filesToRemove = fileStats.slice(0, -this.maxBackups);
            
            for (const { filePath } of filesToRemove) {
                await fs.unlink(filePath);
                console.log(`Removed old backup: ${path.basename(filePath)}`);
            }

            // Cleanup backup directories
            const dirs = await fs.readdir(this.backupDir);
            const backupDirs = dirs.filter(dir => 
                dir.startsWith('clutch-backup-') && 
                !dir.endsWith('.zip')
            );

            for (const dir of backupDirs) {
                const dirPath = path.join(this.backupDir, dir);
                await fs.rmdir(dirPath, { recursive: true });
                console.log(`Removed backup directory: ${dir}`);
            }

        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(backupName) {
        try {
            console.log(`Starting restore from backup: ${backupName}`);
            
            const backupPath = path.join(this.backupDir, backupName);
            const dbPath = path.join(backupPath, 'database');

            // Verify backup exists
            try {
                await fs.access(backupPath);
            } catch (error) {
                throw new Error(`Backup not found: ${backupName}`);
            }

            // Restore database collections
            const collections = await fs.readdir(dbPath);
            
            for (const file of collections) {
                if (file.endsWith('.json') && file !== 'metadata.json') {
                    const collectionName = file.replace('.json', '');
                    const filePath = path.join(dbPath, file);
                    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

                    // Clear existing collection
                    await dbService.getCollection(collectionName).deleteMany({});

                    // Restore data
                    if (data.length > 0) {
                        await dbService.getCollection(collectionName).insertMany(data);
                    }

                    console.log(`Restored collection: ${collectionName}`);
                }
            }

            console.log(`Restore completed successfully: ${backupName}`);
            return { success: true, backupName };
        } catch (error) {
            console.error(`Restore failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * List available backups
     */
    async listBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.endsWith('.zip'));

            const backupInfo = await Promise.all(
                backupFiles.map(async (file) => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = await fs.stat(filePath);
                    
                    return {
                        name: file,
                        size: stats.size,
                        created: stats.birthtime,
                        type: file.split('-')[2]
                    };
                })
            );

            return backupInfo.sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('List backups error:', error);
            return [];
        }
    }

    /**
     * Copy directory recursively
     */
    async copyDirectory(source, destination) {
        try {
            await fs.mkdir(destination, { recursive: true });
            const entries = await fs.readdir(source, { withFileTypes: true });

            for (const entry of entries) {
                const sourcePath = path.join(source, entry.name);
                const destPath = path.join(destination, entry.name);

                if (entry.isDirectory()) {
                    await this.copyDirectory(sourcePath, destPath);
                } else {
                    await fs.copyFile(sourcePath, destPath);
                }
            }
        } catch (error) {
            // Directory might not exist, which is fine
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    /**
     * Get backup status
     */
    async getBackupStatus() {
        try {
            const backups = await this.listBackups();
            const lastBackup = backups[0];
            
            return {
                lastBackup: lastBackup ? {
                    name: lastBackup.name,
                    created: lastBackup.created,
                    type: lastBackup.type
                } : null,
                totalBackups: backups.length,
                backupDirectory: this.backupDir,
                s3Configured: !!this.s3,
                retentionDays: this.retentionDays,
                maxBackups: this.maxBackups
            };
        } catch (error) {
            console.error('Get backup status error:', error);
            return { error: error.message };
        }
    }

    /**
     * Test backup functionality
     */
    async testBackup() {
        try {
            console.log('Testing backup functionality...');
            
            const result = await this.createFullBackup('test');
            
            if (result.success) {
                console.log('Backup test completed successfully');
                return { success: true, message: 'Backup test passed' };
            } else {
                console.log('Backup test failed');
                return { success: false, message: result.error };
            }
        } catch (error) {
            console.error('Backup test error:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Get optimization status
     */
    async getOptimizationStatus() {
        return {
            monitoring: true,
            lastBackup: await this.getBackupStatus(),
            backupSchedules: this.schedules,
            retentionPolicy: {
                days: this.retentionDays,
                maxBackups: this.maxBackups
            },
            s3Configured: !!this.s3,
            backupDirectory: this.backupDir
        };
    }
}

module.exports = new BackupService();
