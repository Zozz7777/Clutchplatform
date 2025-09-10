#!/usr/bin/env node

/**
 * Clutch Platform - Unified Backend Startup Script
 * This script starts the consolidated shared-backend that serves all Clutch applications
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Clutch Platform - Unified Backend...');
console.log('📁 Working directory:', process.cwd());
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');

// Check if we're in the right directory
if (!fs.existsSync(path.join(__dirname, 'server.js'))) {
  console.error('❌ Error: server.js not found in current directory');
  console.error('📝 Please run this script from the shared-backend directory');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  Warning: .env file not found');
  console.warn('📝 Creating .env from .env.example...');
  
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from .env.example');
  } else {
    console.error('❌ Error: .env.example file not found');
    console.error('📝 Please create a .env file with your configuration');
    process.exit(1);
  }
}

// Start the server
console.log('🔌 Starting server...');
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '5000'
  }
});

// Handle server process events
server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Platform startup script completed');
console.log('🌐 Server should be running on port', process.env.PORT || '5000');
console.log('📱 All Clutch applications will now use this unified backend');