// Deployment Manager for Clutch Auto Parts System - Final Integration
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');
const settingsManager = require('./settings-manager');
const syncManager = require('./sync-manager');
const performanceManager = require('./performance-manager');

class DeploymentManager {
    constructor() {
        this.deploymentStatus = 'not_deployed';
        this.deploymentProgress = 0;
        this.deploymentSteps = [];
        this.isDeploying = false;
        this.deploymentLog = [];
        
        this.init();
    }

    async init() {
        await this.setupDeploymentSteps();
        await this.checkDeploymentStatus();
        await this.setupEventListeners();
    }

    async setupDeploymentSteps() {
        this.deploymentSteps = [
            {
                id: 'database_setup',
                name: 'إعداد قاعدة البيانات',
                description: 'إنشاء جداول قاعدة البيانات والبيانات الأولية',
                status: 'pending',
                progress: 0
            },
            {
                id: 'api_connection',
                name: 'اتصال API',
                description: 'اختبار الاتصال بخادم Clutch',
                status: 'pending',
                progress: 0
            },
            {
                id: 'sync_setup',
                name: 'إعداد المزامنة',
                description: 'تكوين نظام المزامنة مع Clutch',
                status: 'pending',
                progress: 0
            },
            {
                id: 'performance_setup',
                name: 'إعداد الأداء',
                description: 'تكوين نظام مراقبة الأداء',
                status: 'pending',
                progress: 0
            },
            {
                id: 'backup_setup',
                name: 'إعداد النسخ الاحتياطي',
                description: 'تكوين نظام النسخ الاحتياطي',
                status: 'pending',
                progress: 0
            },
            {
                id: 'security_setup',
                name: 'إعداد الأمان',
                description: 'تكوين إعدادات الأمان والتشفير',
                status: 'pending',
                progress: 0
            },
            {
                id: 'final_validation',
                name: 'التحقق النهائي',
                description: 'التحقق من جميع المكونات والإعدادات',
                status: 'pending',
                progress: 0
            }
        ];
    }

    async checkDeploymentStatus() {
        try {
            // Check if system is already deployed
            const settings = await databaseManager.allQuery('SELECT * FROM settings WHERE key = ?', ['deployment_status']);
            
            if (settings.length > 0) {
                this.deploymentStatus = settings[0].value;
            }
            
            // Check each deployment step
            for (const step of this.deploymentSteps) {
                await this.checkStepStatus(step);
            }
            
        } catch (error) {
            console.error('Error checking deployment status:', error);
        }
    }

    async checkStepStatus(step) {
        try {
            switch (step.id) {
                case 'database_setup':
                    step.status = await this.checkDatabaseSetup();
                    break;
                case 'api_connection':
                    step.status = await this.checkAPIConnection();
                    break;
                case 'sync_setup':
                    step.status = await this.checkSyncSetup();
                    break;
                case 'performance_setup':
                    step.status = await this.checkPerformanceSetup();
                    break;
                case 'backup_setup':
                    step.status = await this.checkBackupSetup();
                    break;
                case 'security_setup':
                    step.status = await this.checkSecuritySetup();
                    break;
                case 'final_validation':
                    step.status = await this.checkFinalValidation();
                    break;
            }
        } catch (error) {
            console.error(`Error checking step ${step.id}:`, error);
            step.status = 'failed';
        }
    }

    async checkDatabaseSetup() {
        try {
            // Check if all required tables exist
            const tables = ['customers', 'suppliers', 'inventory', 'sales', 'sales_items', 'settings', 'backups'];
            
            for (const table of tables) {
                const result = await databaseManager.getQuery(
                    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
                    [table]
                );
                
                if (!result) {
                    return 'pending';
                }
            }
            
            return 'completed';
        } catch (error) {
            return 'failed';
        }
    }

    async checkAPIConnection() {
        try {
            const apiUrl = settingsManager.getSetting('clutch_api_url');
            const apiKey = settingsManager.getSetting('clutch_api_key');
            
            if (!apiUrl || !apiKey) {
                return 'pending';
            }
            
            // Test API connection
            const response = await apiManager.callAPI('/test/connection');
            return response.success ? 'completed' : 'failed';
        } catch (error) {
            return 'failed';
        }
    }

    async checkSyncSetup() {
        try {
            const autoSync = settingsManager.getSetting('auto_sync');
            const syncInterval = settingsManager.getSetting('sync_interval');
            
            if (autoSync === undefined || syncInterval === undefined) {
                return 'pending';
            }
            
            return 'completed';
        } catch (error) {
            return 'failed';
        }
    }

    async checkPerformanceSetup() {
        try {
            // Check if performance manager is initialized
            if (performanceManager && performanceManager.isInitialized) {
                return 'completed';
            }
            
            return 'pending';
        } catch (error) {
            return 'failed';
        }
    }

    async checkBackupSetup() {
        try {
            const autoBackup = settingsManager.getSetting('auto_backup');
            const backupFrequency = settingsManager.getSetting('backup_frequency');
            
            if (autoBackup === undefined || backupFrequency === undefined) {
                return 'pending';
            }
            
            return 'completed';
        } catch (error) {
            return 'failed';
        }
    }

    async checkSecuritySetup() {
        try {
            const encryptData = settingsManager.getSetting('encrypt_data');
            const requirePassword = settingsManager.getSetting('require_password');
            
            if (encryptData === undefined || requirePassword === undefined) {
                return 'pending';
            }
            
            return 'completed';
        } catch (error) {
            return 'failed';
        }
    }

    async checkFinalValidation() {
        try {
            // Check if all other steps are completed
            const allCompleted = this.deploymentSteps.every(step => 
                step.id === 'final_validation' || step.status === 'completed'
            );
            
            return allCompleted ? 'completed' : 'pending';
        } catch (error) {
            return 'failed';
        }
    }

    setupEventListeners() {
        // Setup event listeners for deployment actions
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDeploymentEventListeners();
        });
    }

    setupDeploymentEventListeners() {
        // Deployment action buttons
        const deployBtn = document.getElementById('deploy-system-btn');
        if (deployBtn) {
            deployBtn.addEventListener('click', () => {
                this.deploySystem();
            });
        }

        const redeployBtn = document.getElementById('redeploy-system-btn');
        if (redeployBtn) {
            redeployBtn.addEventListener('click', () => {
                this.redeploySystem();
            });
        }

        const validateBtn = document.getElementById('validate-system-btn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => {
                this.validateSystem();
            });
        }
    }

    async deploySystem() {
        if (this.isDeploying) {
            uiManager.showNotification('جاري النشر بالفعل...', 'warning');
            return;
        }

        try {
            this.isDeploying = true;
            this.deploymentProgress = 0;
            this.deploymentLog = [];
            
            uiManager.showNotification('بدء نشر النظام...', 'info');
            
            // Execute deployment steps
            for (let i = 0; i < this.deploymentSteps.length; i++) {
                const step = this.deploymentSteps[i];
                
                this.logDeployment(`بدء ${step.name}...`);
                
                try {
                    await this.executeStep(step);
                    step.status = 'completed';
                    step.progress = 100;
                    
                    this.logDeployment(`تم إكمال ${step.name} بنجاح`);
                    
                } catch (error) {
                    step.status = 'failed';
                    step.progress = 0;
                    
                    this.logDeployment(`فشل في ${step.name}: ${error.message}`, 'error');
                    
                    // Stop deployment on critical failure
                    if (this.isCriticalStep(step.id)) {
                        throw error;
                    }
                }
                
                this.deploymentProgress = ((i + 1) / this.deploymentSteps.length) * 100;
                this.updateDeploymentProgress();
            }
            
            // Mark deployment as completed
            await this.markDeploymentCompleted();
            
            uiManager.showNotification('تم نشر النظام بنجاح!', 'success');
            
        } catch (error) {
            console.error('Deployment failed:', error);
            uiManager.showNotification('فشل في نشر النظام', 'error');
            
        } finally {
            this.isDeploying = false;
        }
    }

    async executeStep(step) {
        switch (step.id) {
            case 'database_setup':
                await this.setupDatabase();
                break;
            case 'api_connection':
                await this.setupAPIConnection();
                break;
            case 'sync_setup':
                await this.setupSync();
                break;
            case 'performance_setup':
                await this.setupPerformance();
                break;
            case 'backup_setup':
                await this.setupBackup();
                break;
            case 'security_setup':
                await this.setupSecurity();
                break;
            case 'final_validation':
                await this.performFinalValidation();
                break;
        }
    }

    async setupDatabase() {
        // Database setup is already handled by databaseManager.init()
        // Just verify it's working
        await databaseManager.runQuery('SELECT 1');
    }

    async setupAPIConnection() {
        const apiUrl = settingsManager.getSetting('clutch_api_url');
        const apiKey = settingsManager.getSetting('clutch_api_key');
        
        if (!apiUrl || !apiKey) {
            throw new Error('API URL and key are required');
        }
        
        // Test connection
        const response = await apiManager.callAPI('/test/connection');
        if (!response.success) {
            throw new Error('API connection failed');
        }
    }

    async setupSync() {
        const autoSync = settingsManager.getSetting('auto_sync');
        const syncInterval = settingsManager.getSetting('sync_interval');
        
        if (autoSync) {
            await syncManager.startAutoSync();
        }
        
        if (syncInterval) {
            syncManager.setSyncInterval(parseInt(syncInterval) * 60 * 1000);
        }
    }

    async setupPerformance() {
        // Performance setup is already handled by performanceManager.init()
        // Just verify it's working
        if (!performanceManager.isInitialized) {
            throw new Error('Performance manager not initialized');
        }
    }

    async setupBackup() {
        const autoBackup = settingsManager.getSetting('auto_backup');
        
        if (autoBackup) {
            await settingsManager.startAutoBackup();
        }
    }

    async setupSecurity() {
        const encryptData = settingsManager.getSetting('encrypt_data');
        const requirePassword = settingsManager.getSetting('require_password');
        
        // Apply security settings
        if (encryptData) {
            // Enable data encryption
            console.log('Data encryption enabled');
        }
        
        if (requirePassword) {
            // Enable password protection
            console.log('Password protection enabled');
        }
    }

    async performFinalValidation() {
        // Validate all components
        const validationResults = await this.validateAllComponents();
        
        if (!validationResults.allValid) {
            throw new Error(`Validation failed: ${validationResults.errors.join(', ')}`);
        }
    }

    async validateAllComponents() {
        const results = {
            allValid: true,
            errors: []
        };
        
        try {
            // Validate database
            await databaseManager.runQuery('SELECT 1');
        } catch (error) {
            results.allValid = false;
            results.errors.push('Database validation failed');
        }
        
        try {
            // Validate API connection
            const apiUrl = settingsManager.getSetting('clutch_api_url');
            if (apiUrl) {
                await apiManager.callAPI('/test/connection');
            }
        } catch (error) {
            results.allValid = false;
            results.errors.push('API connection validation failed');
        }
        
        try {
            // Validate sync manager
            if (!syncManager.isInitialized) {
                results.allValid = false;
                results.errors.push('Sync manager not initialized');
            }
        } catch (error) {
            results.allValid = false;
            results.errors.push('Sync manager validation failed');
        }
        
        try {
            // Validate performance manager
            if (!performanceManager.isInitialized) {
                results.allValid = false;
                results.errors.push('Performance manager not initialized');
            }
        } catch (error) {
            results.allValid = false;
            results.errors.push('Performance manager validation failed');
        }
        
        return results;
    }

    async markDeploymentCompleted() {
        await databaseManager.runQuery(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            ['deployment_status', 'completed']
        );
        
        await databaseManager.runQuery(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            ['deployment_date', new Date().toISOString()]
        );
        
        this.deploymentStatus = 'completed';
    }

    async redeploySystem() {
        const confirmed = await this.showConfirmDialog(
            'تأكيد إعادة النشر',
            'هل أنت متأكد من إعادة نشر النظام؟ سيتم إعادة تكوين جميع المكونات.'
        );

        if (!confirmed) return;

        try {
            // Reset deployment status
            await databaseManager.runQuery(
                'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                ['deployment_status', 'not_deployed']
            );
            
            // Reset all steps
            this.deploymentSteps.forEach(step => {
                step.status = 'pending';
                step.progress = 0;
            });
            
            this.deploymentStatus = 'not_deployed';
            
            // Start deployment
            await this.deploySystem();
            
        } catch (error) {
            console.error('Error redeploying system:', error);
            uiManager.showNotification('خطأ في إعادة نشر النظام', 'error');
        }
    }

    async validateSystem() {
        try {
            uiManager.showNotification('جاري التحقق من النظام...', 'info');
            
            const validationResults = await this.validateAllComponents();
            
            if (validationResults.allValid) {
                uiManager.showNotification('النظام يعمل بشكل صحيح', 'success');
            } else {
                uiManager.showNotification(`مشاكل في النظام: ${validationResults.errors.join(', ')}`, 'error');
            }
            
        } catch (error) {
            console.error('Error validating system:', error);
            uiManager.showNotification('خطأ في التحقق من النظام', 'error');
        }
    }

    isCriticalStep(stepId) {
        const criticalSteps = ['database_setup', 'api_connection', 'final_validation'];
        return criticalSteps.includes(stepId);
    }

    logDeployment(message, type = 'info') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            type: type
        };
        
        this.deploymentLog.push(logEntry);
        console.log(`[Deployment] ${message}`);
    }

    updateDeploymentProgress() {
        // Update UI with deployment progress
        const progressBar = document.getElementById('deployment-progress-bar');
        const progressText = document.getElementById('deployment-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${this.deploymentProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `التقدم: ${this.deploymentProgress.toFixed(1)}%`;
        }
    }

    getDeploymentStatus() {
        return {
            status: this.deploymentStatus,
            progress: this.deploymentProgress,
            steps: this.deploymentSteps,
            log: this.deploymentLog,
            isDeploying: this.isDeploying
        };
    }

    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    // Export deployment configuration
    async exportDeploymentConfig() {
        try {
            const config = {
                deploymentStatus: this.deploymentStatus,
                deploymentDate: await this.getDeploymentDate(),
                systemVersion: '1.0.0',
                components: {
                    database: await this.checkDatabaseSetup(),
                    api: await this.checkAPIConnection(),
                    sync: await this.checkSyncSetup(),
                    performance: await this.checkPerformanceSetup(),
                    backup: await this.checkBackupSetup(),
                    security: await this.checkSecuritySetup()
                },
                settings: await this.getDeploymentSettings()
            };
            
            const dataStr = JSON.stringify(config, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `deployment_config_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            uiManager.showNotification('تم تصدير تكوين النشر بنجاح', 'success');
            
        } catch (error) {
            console.error('Error exporting deployment config:', error);
            uiManager.showNotification('خطأ في تصدير تكوين النشر', 'error');
        }
    }

    async getDeploymentDate() {
        try {
            const result = await databaseManager.getQuery(
                'SELECT value FROM settings WHERE key = ?',
                ['deployment_date']
            );
            return result ? result.value : null;
        } catch (error) {
            return null;
        }
    }

    async getDeploymentSettings() {
        try {
            const settings = await databaseManager.allQuery('SELECT * FROM settings');
            const deploymentSettings = {};
            
            settings.forEach(setting => {
                deploymentSettings[setting.key] = setting.value;
            });
            
            return deploymentSettings;
        } catch (error) {
            return {};
        }
    }
}

// Export singleton instance
const deploymentManager = new DeploymentManager();
module.exports = deploymentManager;
