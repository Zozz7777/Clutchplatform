#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Clutch Auto Parts System');
console.log('============================');
console.log('');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ ERROR: package.json not found!');
    console.error('Please run this executable from the Clutch Auto Parts System directory.');
    process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    const install = spawn('npm', ['install'], { 
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });
    
    install.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ ERROR: Failed to install dependencies');
            process.exit(1);
        }
        startApplication();
    });
} else {
    startApplication();
}

function startApplication() {
    console.log('🔨 Building application...');
    const build = spawn('npm', ['run', 'build'], { 
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });
    
    build.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ ERROR: Failed to build application');
            process.exit(1);
        }
        
        console.log('🚀 Starting Clutch Auto Parts System...');
        console.log('The application will open in a new window.');
        console.log('');
        
        const start = spawn('npm', ['start'], { 
            stdio: 'inherit',
            shell: true,
            cwd: __dirname
        });
        
        start.on('close', (code) => {
            console.log('');
            console.log('👋 Application closed. Thank you for using Clutch Auto Parts System!');
            process.exit(code);
        });
    });
}
