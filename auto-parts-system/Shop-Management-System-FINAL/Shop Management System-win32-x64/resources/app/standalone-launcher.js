#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Clutch Auto Parts System');
console.log('============================');
console.log('');

// Get the directory where this executable is located
const appDir = path.dirname(process.execPath);
const packageJsonPath = path.join(appDir, 'package.json');

// Check if we're in the right directory
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ ERROR: package.json not found!');
    console.error('Please run this executable from the Clutch Auto Parts System directory.');
    process.exit(1);
}

try {
    // Check if node_modules exists
    const nodeModulesPath = path.join(appDir, 'node_modules');
    const distPath = path.join(appDir, 'dist');
    
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 Installing dependencies...');
        const installProcess = spawn('npm', ['install'], {
            cwd: appDir,
            stdio: 'inherit',
            shell: true
        });
        
        installProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ ERROR: Failed to install dependencies');
                process.exit(1);
            }
            buildAndStart();
        });
    } else {
        buildAndStart();
    }
    
    function buildAndStart() {
        // Check if dist exists and is recent
        if (!fs.existsSync(distPath)) {
            console.log('🔨 Building application...');
            const buildProcess = spawn('npm', ['run', 'build'], {
                cwd: appDir,
                stdio: 'inherit',
                shell: true
            });
            
            buildProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('❌ ERROR: Failed to build application');
                    process.exit(1);
                }
                startApp();
            });
        } else {
            startApp();
        }
    }
    
    function startApp() {
        console.log('🚀 Starting Clutch Auto Parts System...');
        console.log('The application will open in a new window.');
        console.log('');
        
        const startProcess = spawn('npm', ['start'], {
            cwd: appDir,
            stdio: 'inherit',
            shell: true
        });
        
        startProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ Application exited with error code:', code);
            } else {
                console.log('✅ Application closed successfully');
            }
        });
    }

} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Please make sure Node.js is installed and try again.');
    process.exit(1);
}
