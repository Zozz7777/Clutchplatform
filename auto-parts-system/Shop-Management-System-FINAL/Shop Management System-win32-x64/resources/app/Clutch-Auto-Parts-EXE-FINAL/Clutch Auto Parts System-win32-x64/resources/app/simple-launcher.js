#!/usr/bin/env node

const { execSync } = require('child_process');
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

try {
    // Check if node_modules exists
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    }

    // Build the application
    console.log('🔨 Building application...');
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });

    // Start the application
    console.log('🚀 Starting Clutch Auto Parts System...');
    console.log('The application will open in a new window.');
    console.log('');
    
    execSync('npm start', { stdio: 'inherit', cwd: __dirname });

} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Please make sure Node.js is installed and try again.');
    process.exit(1);
}
