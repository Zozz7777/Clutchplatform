#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Clutch Auto Parts System');
console.log('============================');
console.log('');

// Get the directory where this executable is located
const appDir = path.dirname(process.execPath);

try {
    // Check if dist directory exists
    const distPath = path.join(appDir, 'dist');
    if (!fs.existsSync(distPath)) {
        console.error('❌ ERROR: Application not built!');
        console.error('Please run "npm run build" first.');
        process.exit(1);
    }
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(appDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.error('❌ ERROR: Dependencies not installed!');
        console.error('Please run "npm install" first.');
        process.exit(1);
    }
    
    console.log('🚀 Starting Clutch Auto Parts System...');
    console.log('The application will open in a new window.');
    console.log('');
    
    // Start the Electron app directly
    const electronPath = path.join(nodeModulesPath, '.bin', 'electron.cmd');
    const mainPath = path.join(distPath, 'main.js');
    
    if (!fs.existsSync(electronPath)) {
        console.error('❌ ERROR: Electron not found!');
        console.error('Please run "npm install" to install dependencies.');
        process.exit(1);
    }
    
    if (!fs.existsSync(mainPath)) {
        console.error('❌ ERROR: Main application file not found!');
        console.error('Please run "npm run build" to build the application.');
        process.exit(1);
    }
    
    const startProcess = spawn(electronPath, [mainPath], {
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
    
    startProcess.on('error', (error) => {
        console.error('❌ ERROR starting application:', error.message);
        process.exit(1);
    });

} catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
}
