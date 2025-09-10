#!/usr/bin/env node

/**
 * Backend Connection Test Script for Clutch Auto Parts System
 * 
 * This script tests all backend connections and endpoints to ensure
 * the system is properly connected to the Clutch backend.
 * 
 * Usage:
 *   node scripts/test-backend-connections.js
 *   node scripts/test-backend-connections.js --verbose
 *   node scripts/test-backend-connections.js --endpoint auth.verify
 *   node scripts/test-backend-connections.js --category inventory
 */

const path = require('path');
const fs = require('fs');

// Add the src directory to the module path
const srcPath = path.join(__dirname, '..', 'src', 'renderer', 'js');
require('module').globalPaths.push(srcPath);

// Mock Electron environment for testing
global.require = require;
global.module = module;
global.exports = exports;

// Mock Electron APIs
global.electron = {
    ipcRenderer: {
        invoke: async (channel, ...args) => {
            console.log(`Mock IPC call: ${channel}`, args);
            return { success: true };
        },
        on: (channel, callback) => {
            console.log(`Mock IPC listener: ${channel}`);
        }
    }
};

// Mock WebSocket for testing
global.WebSocket = class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 1; // OPEN
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        
        // Simulate connection
        setTimeout(() => {
            if (this.onopen) this.onopen({});
        }, 100);
    }
    
    send(data) {
        console.log('Mock WebSocket send:', data);
    }
    
    close() {
        console.log('Mock WebSocket close');
    }
};

// Mock localStorage
global.localStorage = {
    getItem: (key) => null,
    setItem: (key, value) => {},
    removeItem: (key) => {}
};

// Mock navigator
global.navigator = {
    onLine: true
};

// Mock document for testing
global.document = {
    getElementById: (id) => null,
    querySelector: (selector) => null,
    querySelectorAll: (selector) => [],
    createElement: (tag) => ({
        innerHTML: '',
        textContent: '',
        className: '',
        appendChild: () => {},
        addEventListener: () => {}
    }),
    body: {
        appendChild: () => {},
        removeChild: () => {}
    }
};

// Mock window
global.window = {
    location: { href: 'file://test' },
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Mock fetch
global.fetch = async (url) => {
    console.log(`Mock fetch: ${url}`);
    return {
        text: async () => '<div>Mock HTML content</div>',
        json: async () => ({ success: true }),
        status: 200,
        ok: true
    };
};

// Mock URL
global.URL = {
    createObjectURL: (blob) => 'mock-url',
    revokeObjectURL: (url) => {}
};

// Mock Blob
global.Blob = class MockBlob {
    constructor(data, options) {
        this.data = data;
        this.options = options;
    }
};

// Mock console for better output
const originalConsole = console;
global.console = {
    ...originalConsole,
    log: (...args) => {
        originalConsole.log(`[${new Date().toISOString()}]`, ...args);
    },
    error: (...args) => {
        originalConsole.error(`[${new Date().toISOString()}] ERROR:`, ...args);
    },
    warn: (...args) => {
        originalConsole.warn(`[${new Date().toISOString()}] WARN:`, ...args);
    }
};

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const specificEndpoint = args.find(arg => arg.startsWith('--endpoint='))?.split('=')[1];
const specificCategory = args.find(arg => arg.startsWith('--category='))?.split('=')[1];

async function runBackendConnectionTests() {
    console.log('🚀 Starting Clutch Auto Parts System Backend Connection Tests');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Backend Configuration
        console.log('\n📋 Test 1: Backend Configuration');
        console.log('-'.repeat(40));
        
        const backendConfig = require('../src/renderer/js/backend-config');
        await backendConfig.initialize();
        
        const config = backendConfig.getConnectionStatus();
        console.log(`✓ Backend configuration loaded`);
        console.log(`  - API Base URL: ${config.config.apiBaseURL}`);
        console.log(`  - WebSocket URL: ${config.config.websocketURL}`);
        console.log(`  - Has API Key: ${config.credentials.hasApiKey}`);
        console.log(`  - Has Shop ID: ${config.credentials.hasShopId}`);
        
        // Test 2: API Manager
        console.log('\n🔌 Test 2: API Manager');
        console.log('-'.repeat(40));
        
        const apiManager = require('../src/renderer/js/api');
        await apiManager.initialize();
        
        const apiConnected = await apiManager.testConnection();
        console.log(`✓ API Manager initialized`);
        console.log(`  - Connection Status: ${apiConnected ? 'Connected' : 'Disconnected'}`);
        console.log(`  - Base URL: ${apiManager.baseURL}`);
        console.log(`  - Shop ID: ${apiManager.shopId}`);
        
        // Test 3: WebSocket Manager
        console.log('\n🌐 Test 3: WebSocket Manager');
        console.log('-'.repeat(40));
        
        const websocketManager = require('../src/renderer/js/websocket-manager');
        const wsStatus = websocketManager.getConnectionStatus();
        console.log(`✓ WebSocket Manager initialized`);
        console.log(`  - Connection Status: ${wsStatus.isConnected ? 'Connected' : 'Disconnected'}`);
        console.log(`  - Reconnect Attempts: ${wsStatus.reconnectAttempts}`);
        
        // Test 4: Connection Manager
        console.log('\n🔗 Test 4: Connection Manager');
        console.log('-'.repeat(40));
        
        const connectionManager = require('../src/renderer/js/connection-manager');
        await connectionManager.init();
        
        const connectionStatus = connectionManager.getConnectionStatus();
        console.log(`✓ Connection Manager initialized`);
        console.log(`  - Overall Status: ${connectionStatus.overall ? 'Connected' : 'Disconnected'}`);
        console.log(`  - API Status: ${connectionStatus.api.connected ? 'Connected' : 'Disconnected'}`);
        console.log(`  - WebSocket Status: ${connectionStatus.websocket.connected ? 'Connected' : 'Disconnected'}`);
        
        // Test 5: Endpoint Testing
        console.log('\n🎯 Test 5: Endpoint Testing');
        console.log('-'.repeat(40));
        
        const endpointTester = require('../src/renderer/js/endpoint-tester');
        
        if (specificEndpoint) {
            console.log(`Testing specific endpoint: ${specificEndpoint}`);
            const [category, action] = specificEndpoint.split('.');
            const result = await endpointTester.testSpecificEndpoint(category, action);
            console.log(`  - ${specificEndpoint}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
            if (!result.success) {
                console.log(`    Error: ${result.error}`);
            }
        } else if (specificCategory) {
            console.log(`Testing category: ${specificCategory}`);
            const results = await endpointTester.testEndpointGroup(specificCategory);
            const successful = Object.values(results).filter(r => r.success).length;
            const total = Object.keys(results).length;
            console.log(`  - ${specificCategory}: ${successful}/${total} successful`);
        } else {
            console.log('Running comprehensive endpoint tests...');
            const testResults = await endpointTester.runAllTests();
            
            const successful = Object.values(testResults).filter(r => r.success).length;
            const total = Object.keys(testResults).length;
            const successRate = (successful / total) * 100;
            
            console.log(`✓ Endpoint testing completed`);
            console.log(`  - Total Tests: ${total}`);
            console.log(`  - Successful: ${successful}`);
            console.log(`  - Failed: ${total - successful}`);
            console.log(`  - Success Rate: ${successRate.toFixed(2)}%`);
            
            if (verbose) {
                console.log('\nDetailed Results:');
                Object.entries(testResults).forEach(([name, result]) => {
                    const status = result.success ? '✓' : '✗';
                    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
                    console.log(`  ${status} ${name}: ${result.success ? 'SUCCESS' : 'FAILED'} (${time})`);
                    if (!result.success && result.error) {
                        console.log(`    Error: ${result.error}`);
                    }
                });
            }
        }
        
        // Test 6: Database Manager
        console.log('\n💾 Test 6: Database Manager');
        console.log('-'.repeat(40));
        
        const databaseManager = require('../src/renderer/js/database');
        await databaseManager.initialize();
        
        const dbTest = await databaseManager.getQuery('SELECT 1 as test');
        console.log(`✓ Database Manager initialized`);
        console.log(`  - Database Connection: ${dbTest ? 'Connected' : 'Failed'}`);
        
        // Test 7: Sync Manager
        console.log('\n🔄 Test 7: Sync Manager');
        console.log('-'.repeat(40));
        
        const syncManager = require('../src/renderer/js/sync-manager');
        await syncManager.initialize();
        
        const syncStatus = syncManager.getStatus();
        console.log(`✓ Sync Manager initialized`);
        console.log(`  - Sync Status: ${syncStatus.isRunning ? 'Running' : 'Stopped'}`);
        console.log(`  - Queue Size: ${syncStatus.queueSize}`);
        console.log(`  - Last Sync: ${syncStatus.lastSync || 'Never'}`);
        
        // Test 8: Performance Monitor
        console.log('\n📊 Test 8: Performance Monitor');
        console.log('-'.repeat(40));
        
        try {
            const performanceMonitor = require('../src/renderer/js/performance-monitor');
            const perfStatus = performanceMonitor.getStatus();
            console.log(`✓ Performance Monitor initialized`);
            console.log(`  - Monitor Status: ${perfStatus.isRunning ? 'Running' : 'Stopped'}`);
        } catch (error) {
            console.log(`⚠ Performance Monitor not available: ${error.message}`);
        }
        
        // Summary
        console.log('\n📈 Test Summary');
        console.log('=' .repeat(60));
        
        const finalStatus = connectionManager.getConnectionStatus();
        const stats = connectionManager.getConnectionStats();
        
        console.log(`Overall Connection Status: ${finalStatus.overall ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
        console.log(`API Connection: ${finalStatus.api.connected ? '✅ Connected' : '❌ Disconnected'}`);
        console.log(`WebSocket Connection: ${finalStatus.websocket.connected ? '✅ Connected' : '❌ Disconnected'}`);
        console.log(`Endpoint Success Rate: ${stats.connectionRate.toFixed(2)}%`);
        console.log(`Required Endpoints: ${stats.connectedRequiredEndpoints}/${stats.requiredEndpoints}`);
        
        if (finalStatus.overall) {
            console.log('\n🎉 All backend connections are working properly!');
            console.log('The Clutch Auto Parts System is ready for use.');
        } else {
            console.log('\n⚠️  Some backend connections are not working properly.');
            console.log('Please check the configuration and network connectivity.');
        }
        
        // Cleanup
        connectionManager.destroy();
        websocketManager.destroy();
        
    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        if (verbose) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    if (verbose) {
        console.error('Stack trace:', error.stack);
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the tests
if (require.main === module) {
    runBackendConnectionTests()
        .then(() => {
            console.log('\n✅ Backend connection tests completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Backend connection tests failed:', error.message);
            process.exit(1);
        });
}

module.exports = { runBackendConnectionTests };
