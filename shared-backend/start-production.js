#!/usr/bin/env node

/**
 * Production Startup Script with Optimized Memory Configuration
 * This script ensures proper memory allocation for production deployment
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Clutch Backend with Optimized Memory Configuration');
console.log('='.repeat(60));

// Memory configuration
const memoryConfig = {
  maxOldSpaceSize: 2048, // 2GB heap size (doubled from default ~1GB)
  maxSemiSpaceSize: 128,  // 128MB semi-space
  maxExecutableSize: 1024, // 1GB executable size
  optimizeForSize: false,  // Optimize for performance, not size
  gcInterval: 100,        // Garbage collection interval
  gcGlobal: true          // Enable global garbage collection
};

// Build Node.js arguments
const nodeArgs = [
  `--max-old-space-size=${memoryConfig.maxOldSpaceSize}`,
  `--max-semi-space-size=${memoryConfig.maxSemiSpaceSize}`,
  `--max-executable-size=${memoryConfig.maxExecutableSize}`,
  `--optimize-for-size=${memoryConfig.optimizeForSize}`,
  `--gc-interval=${memoryConfig.gcInterval}`,
  `--expose-gc=${memoryConfig.gcGlobal}`,
  '--trace-warnings',
  '--trace-deprecation'
];

// Server file path
const serverFile = path.join(__dirname, 'server.js');

console.log('📊 Memory Configuration:');
console.log(`  Heap Size: ${memoryConfig.maxOldSpaceSize}MB (doubled from default)`);
console.log(`  Semi-Space: ${memoryConfig.maxSemiSpaceSize}MB`);
console.log(`  Executable Size: ${memoryConfig.maxExecutableSize}MB`);
console.log(`  GC Enabled: ${memoryConfig.gcGlobal}`);
console.log('');

console.log('🔧 Node.js Arguments:');
nodeArgs.forEach(arg => console.log(`  ${arg}`));
console.log('');

console.log('🎯 Starting server...');
console.log('');

// Start the server with optimized memory configuration
const serverProcess = spawn('node', [...nodeArgs, serverFile], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    NODE_OPTIONS: nodeArgs.join(' ')
  }
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`🔄 Server stopped with signal: ${signal}`);
  } else {
    console.log(`🔄 Server stopped with code: ${code}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  serverProcess.kill('SIGTERM');
  process.exit(1);
});
