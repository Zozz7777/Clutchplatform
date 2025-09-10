// Connection Status Manager for Clutch Auto Parts System
const connectionManager = require('./connection-manager');
const backendConfig = require('./backend-config');
const databaseManager = require('./simple-database');
const endpointTester = require('./endpoint-tester');

class ConnectionStatusManager {
    constructor() {
        this.updateInterval = null;
        this.logEntries = [];
        this.maxLogEntries = 100;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startPeriodicUpdates();
        this.addLogEntry('info', 'Connection Status Manager initialized');
    }
    
    setupEventListeners() {
        // Refresh connections button
        const refreshBtn = document.getElementById('refresh-connections');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshConnections());
        }
        
        // Force reconnect button
        const reconnectBtn = document.getElementById('force-reconnect');
        if (reconnectBtn) {
            reconnectBtn.addEventListener('click', () => this.forceReconnect());
        }
        
        // Clear log button
        const clearLogBtn = document.getElementById('clear-log');
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => this.clearLog());
        }
        
        // Export log button
        const exportLogBtn = document.getElementById('export-log');
        if (exportLogBtn) {
            exportLogBtn.addEventListener('click', () => this.exportLog());
        }
    }
    
    async refreshConnections() {
        try {
            this.addLogEntry('info', 'Refreshing all connections...');
            
            // Update UI to show checking status
            this.updateCheckingStatus();
            
            // Run comprehensive endpoint testing
            this.addLogEntry('info', 'Running comprehensive endpoint tests...');
            const testResults = await endpointTester.runAllTests();
            
            // Test all connections
            const results = await connectionManager.testAllConnections();
            
            // Update UI with results
            await this.updateConnectionStatus(results);
            
            // Log test results
            const successfulTests = Object.values(testResults).filter(result => result.success).length;
            const totalTests = Object.keys(testResults).length;
            this.addLogEntry('success', `Endpoint testing completed: ${successfulTests}/${totalTests} successful`);
            
        } catch (error) {
            console.error('Error refreshing connections:', error);
            this.addLogEntry('error', `Failed to refresh connections: ${error.message}`);
        }
    }
    
    async forceReconnect() {
        try {
            this.addLogEntry('info', 'Forcing reconnection...');
            
            // Update UI to show reconnecting status
            this.updateReconnectingStatus();
            
            // Force reconnection
            await connectionManager.forceReconnect();
            
            // Update UI
            await this.updateConnectionStatus();
            
            this.addLogEntry('success', 'Reconnection completed successfully');
            
        } catch (error) {
            console.error('Error forcing reconnection:', error);
            this.addLogEntry('error', `Reconnection failed: ${error.message}`);
        }
    }
    
    async updateConnectionStatus(results = null) {
        try {
            // Get current connection status
            const status = connectionManager.getConnectionStatus();
            const stats = connectionManager.getConnectionStats();
            
            // Update overall connection status
            this.updateOverallStatus(status);
            
            // Update API status
            this.updateAPIStatus(status.api);
            
            // Update WebSocket status
            this.updateWebSocketStatus(status.websocket);
            
            // Update endpoints status
            this.updateEndpointsStatus(status.endpoints);
            
            // Update statistics
            this.updateStatistics(stats);
            
            // Update system health
            await this.updateSystemHealth();
            
        } catch (error) {
            console.error('Error updating connection status:', error);
            this.addLogEntry('error', `Failed to update connection status: ${error.message}`);
        }
    }
    
    updateOverallStatus(status) {
        const statusElement = document.getElementById('connection-status');
        const detailsElement = document.getElementById('connection-details');
        
        if (statusElement) {
            const isConnected = status.overall;
            statusElement.className = `connection-status ${isConnected ? 'connected' : 'disconnected'}`;
            
            const statusText = statusElement.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = isConnected ? 'متصل بالخادم' : 'غير متصل بالخادم';
            }
            
            const statusIndicator = statusElement.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.className = `status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
            }
        }
        
        if (detailsElement) {
            const apiStatus = status.api.connected ? '✓' : '✗';
            const wsStatus = status.websocket.connected ? '✓' : '✗';
            
            detailsElement.innerHTML = `
                <div class="status-item">
                    <span class="status-label">API:</span>
                    <span class="status-value ${status.api.connected ? 'success' : 'error'}">${apiStatus}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">WebSocket:</span>
                    <span class="status-value ${status.websocket.connected ? 'success' : 'error'}">${wsStatus}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">محاولات إعادة الاتصال:</span>
                    <span class="status-value">${status.retryAttempts}/${status.maxRetryAttempts}</span>
                </div>
            `;
        }
    }
    
    updateAPIStatus(apiStatus) {
        const statusElement = document.getElementById('api-status');
        const urlElement = document.getElementById('api-url');
        const lastCheckElement = document.getElementById('api-last-check');
        const responseTimeElement = document.getElementById('api-response-time');
        const errorsElement = document.getElementById('api-errors');
        
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            const text = statusElement.querySelector('.status-text');
            
            if (indicator) {
                indicator.className = `status-indicator ${apiStatus.connected ? 'connected' : 'disconnected'}`;
            }
            
            if (text) {
                text.textContent = apiStatus.connected ? 'متصل' : 'غير متصل';
            }
        }
        
        if (urlElement) {
            urlElement.textContent = backendConfig.config.api.baseURL;
        }
        
        if (lastCheckElement) {
            lastCheckElement.textContent = apiStatus.lastCheck ? 
                new Date(apiStatus.lastCheck).toLocaleString('ar-SA') : '-';
        }
        
        if (responseTimeElement) {
            // Calculate average response time from endpoints
            const endpoints = Object.values(connectionManager.connectionStatus.endpoints);
            const responseTimes = endpoints
                .filter(ep => ep.responseTime)
                .map(ep => ep.responseTime);
            
            if (responseTimes.length > 0) {
                const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                responseTimeElement.textContent = `${Math.round(avgTime)}ms`;
            } else {
                responseTimeElement.textContent = '-';
            }
        }
        
        if (errorsElement) {
            if (apiStatus.errors && apiStatus.errors.length > 0) {
                errorsElement.className = 'connection-errors has-errors';
                errorsElement.innerHTML = apiStatus.errors
                    .map(error => `<div class="error-item">${error}</div>`)
                    .join('');
            } else {
                errorsElement.className = 'connection-errors';
                errorsElement.innerHTML = '';
            }
        }
    }
    
    updateWebSocketStatus(wsStatus) {
        const statusElement = document.getElementById('websocket-status');
        const urlElement = document.getElementById('websocket-url');
        const lastCheckElement = document.getElementById('websocket-last-check');
        const retryAttemptsElement = document.getElementById('websocket-retry-attempts');
        const errorsElement = document.getElementById('websocket-errors');
        
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            const text = statusElement.querySelector('.status-text');
            
            if (indicator) {
                indicator.className = `status-indicator ${wsStatus.connected ? 'connected' : 'disconnected'}`;
            }
            
            if (text) {
                text.textContent = wsStatus.connected ? 'متصل' : 'غير متصل';
            }
        }
        
        if (urlElement) {
            urlElement.textContent = backendConfig.getWebSocketURL();
        }
        
        if (lastCheckElement) {
            lastCheckElement.textContent = wsStatus.lastCheck ? 
                new Date(wsStatus.lastCheck).toLocaleString('ar-SA') : '-';
        }
        
        if (retryAttemptsElement) {
            retryAttemptsElement.textContent = connectionManager.retryAttempts || '0';
        }
        
        if (errorsElement) {
            if (wsStatus.errors && wsStatus.errors.length > 0) {
                errorsElement.className = 'connection-errors has-errors';
                errorsElement.innerHTML = wsStatus.errors
                    .map(error => `<div class="error-item">${error}</div>`)
                    .join('');
            } else {
                errorsElement.className = 'connection-errors';
                errorsElement.innerHTML = '';
            }
        }
    }
    
    updateEndpointsStatus(endpoints) {
        const connectedElement = document.getElementById('connected-endpoints');
        const totalElement = document.getElementById('total-endpoints');
        const gridElement = document.getElementById('endpoints-grid');
        
        if (connectedElement && totalElement) {
            const total = Object.keys(endpoints).length;
            const connected = Object.values(endpoints).filter(ep => ep.connected).length;
            
            connectedElement.textContent = connected;
            totalElement.textContent = total;
        }
        
        if (gridElement) {
            gridElement.innerHTML = '';
            
            Object.entries(endpoints).forEach(([key, status]) => {
                const [category, action] = key.split('.');
                const isRequired = connectionManager.endpointTests.find(
                    test => test.category === category && test.action === action
                )?.required || false;
                
                const endpointDiv = document.createElement('div');
                endpointDiv.className = `endpoint-item ${status.connected ? 'connected' : 'disconnected'} ${!isRequired ? 'optional' : ''}`;
                
                endpointDiv.innerHTML = `
                    <div class="endpoint-name">${category}.${action}</div>
                    <div class="endpoint-status">
                        <span class="status-indicator ${status.connected ? 'connected' : 'disconnected'}"></span>
                        <span>${status.connected ? 'متصل' : 'غير متصل'}</span>
                        ${status.responseTime ? `<div class="endpoint-response-time">${status.responseTime}ms</div>` : ''}
                    </div>
                `;
                
                gridElement.appendChild(endpointDiv);
            });
        }
    }
    
    updateStatistics(stats) {
        const connectionRateElement = document.getElementById('connection-rate');
        const avgResponseTimeElement = document.getElementById('avg-response-time');
        const lastSyncElement = document.getElementById('last-sync');
        const connectionModeElement = document.getElementById('connection-mode');
        
        if (connectionRateElement) {
            connectionRateElement.textContent = `${Math.round(stats.connectionRate)}%`;
        }
        
        if (avgResponseTimeElement) {
            // Calculate average response time
            const endpoints = Object.values(connectionManager.connectionStatus.endpoints);
            const responseTimes = endpoints
                .filter(ep => ep.responseTime)
                .map(ep => ep.responseTime);
            
            if (responseTimes.length > 0) {
                const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                avgResponseTimeElement.textContent = `${Math.round(avgTime)}ms`;
            } else {
                avgResponseTimeElement.textContent = '-';
            }
        }
        
        if (lastSyncElement) {
            const lastSync = connectionManager.connectionStatus.lastSync;
            lastSyncElement.textContent = lastSync ? 
                new Date(lastSync).toLocaleString('ar-SA') : 'لم يتم المزامنة';
        }
        
        if (connectionModeElement) {
            if (stats.overallConnected) {
                connectionModeElement.textContent = 'متصل';
                connectionModeElement.className = 'stat-value success';
            } else if (connectionManager.connectionStatus.offlineMode) {
                connectionModeElement.textContent = 'وضع عدم الاتصال';
                connectionModeElement.className = 'stat-value warning';
            } else {
                connectionModeElement.textContent = 'غير متصل';
                connectionModeElement.className = 'stat-value error';
            }
        }
    }
    
    async updateSystemHealth() {
        try {
            // Check local database health
            await this.checkLocalDBHealth();
            
            // Check sync manager health
            await this.checkSyncManagerHealth();
            
            // Check performance monitor health
            await this.checkPerformanceMonitorHealth();
            
        } catch (error) {
            console.error('Error updating system health:', error);
        }
    }
    
    async checkLocalDBHealth() {
        const healthElement = document.getElementById('local-db-health');
        if (!healthElement) return;
        
        try {
            // Test database connection
            await databaseManager.getQuery('SELECT 1');
            
            const indicator = healthElement.querySelector('.status-indicator');
            const text = healthElement.querySelector('.status-text');
            
            if (indicator) indicator.className = 'status-indicator connected';
            if (text) text.textContent = 'سليم';
            
        } catch (error) {
            const indicator = healthElement.querySelector('.status-indicator');
            const text = healthElement.querySelector('.status-text');
            
            if (indicator) indicator.className = 'status-indicator disconnected';
            if (text) text.textContent = 'خطأ';
        }
    }
    
    async checkSyncManagerHealth() {
        const healthElement = document.getElementById('sync-manager-health');
        if (!healthElement) return;
        
        try {
            const syncManager = require('./sync-manager');
            const status = syncManager.getStatus();
            
            const indicator = healthElement.querySelector('.status-indicator');
            const text = healthElement.querySelector('.status-text');
            
            if (indicator) {
                indicator.className = `status-indicator ${status.isRunning ? 'connected' : 'disconnected'}`;
            }
            if (text) {
                text.textContent = status.isRunning ? 'يعمل' : 'متوقف';
            }
            
        } catch (error) {
            const indicator = healthElement.querySelector('.status-indicator');
            const text = healthElement.querySelector('.status-text');
            
            if (indicator) indicator.className = 'status-indicator disconnected';
            if (text) text.textContent = 'خطأ';
        }
    }
    
    async checkPerformanceMonitorHealth() {
        const healthElement = document.getElementById('performance-monitor-health');
        if (!healthElement) return;
        
        try {
            const performanceMonitor = require('./performance-monitor');
            const status = performanceMonitor.getStatus();
            
            const indicator = healthElement.querySelector('.status-indicator');
            const text = healthElement.querySelector('.status-text');
            
            if (indicator) {
                indicator.className = `status-indicator ${status.isRunning ? 'connected' : 'disconnected'}`;
            }
            if (text) {
                text.textContent = status.isRunning ? 'يعمل' : 'متوقف';
            }
            
        } catch (error) {
            const indicator = healthElement.querySelector('.status-indicator');
            const text = healthElement.querySelector('.status-text');
            
            if (indicator) indicator.className = 'status-indicator disconnected';
            if (text) text.textContent = 'خطأ';
        }
    }
    
    updateCheckingStatus() {
        // Update all status indicators to show checking
        const indicators = document.querySelectorAll('.status-indicator');
        indicators.forEach(indicator => {
            indicator.className = 'status-indicator checking';
        });
        
        const statusTexts = document.querySelectorAll('.status-text');
        statusTexts.forEach(text => {
            if (text.textContent !== 'يعمل' && text.textContent !== 'سليم') {
                text.textContent = 'جاري الفحص...';
            }
        });
    }
    
    updateReconnectingStatus() {
        // Update connection status to show reconnecting
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            const text = statusElement.querySelector('.status-text');
            
            if (indicator) indicator.className = 'status-indicator checking';
            if (text) text.textContent = 'جاري إعادة الاتصال...';
        }
    }
    
    addLogEntry(level, message) {
        const timestamp = new Date().toLocaleTimeString('ar-SA');
        const entry = {
            timestamp,
            level,
            message
        };
        
        this.logEntries.unshift(entry);
        
        // Keep only the last maxLogEntries
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries = this.logEntries.slice(0, this.maxLogEntries);
        }
        
        this.updateLogDisplay();
    }
    
    updateLogDisplay() {
        const logElement = document.getElementById('connection-log');
        if (!logElement) return;
        
        logElement.innerHTML = this.logEntries
            .map(entry => `
                <div class="log-entry">
                    <span class="log-timestamp">${entry.timestamp}</span>
                    <span class="log-level ${entry.level}">[${entry.level.toUpperCase()}]</span>
                    <span class="log-message">${entry.message}</span>
                </div>
            `)
            .join('');
    }
    
    clearLog() {
        this.logEntries = [];
        this.updateLogDisplay();
        this.addLogEntry('info', 'Connection log cleared');
    }
    
    exportLog() {
        try {
            const logData = this.logEntries.map(entry => 
                `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`
            ).join('\n');
            
            const blob = new Blob([logData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `connection-log-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.addLogEntry('info', 'Connection log exported successfully');
            
        } catch (error) {
            console.error('Error exporting log:', error);
            this.addLogEntry('error', `Failed to export log: ${error.message}`);
        }
    }
    
    startPeriodicUpdates() {
        // Update connection status every 30 seconds
        this.updateInterval = setInterval(async () => {
            try {
                await this.updateConnectionStatus();
            } catch (error) {
                console.error('Error in periodic update:', error);
            }
        }, 30000);
    }
    
    stopPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    destroy() {
        this.stopPeriodicUpdates();
        this.logEntries = [];
    }
}

// Export singleton instance
const connectionStatusManager = new ConnectionStatusManager();
module.exports = connectionStatusManager;
