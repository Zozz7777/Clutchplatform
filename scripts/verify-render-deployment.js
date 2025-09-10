#!/usr/bin/env node

/**
 * Render Deployment Verification Script
 * Tests the configuration and connectivity for Render.com deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Render Deployment Verification Script');
console.log('=====================================\n');

// Check 1: Project structure
console.log('📁 Checking project structure...');
const requiredFiles = [
    'shared-backend/render.yaml',
    'shared-backend/package.json',
    'shared-backend/start.js',
    'shared-backend/server.js'
];

let structureOk = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        structureOk = false;
    }
});

// Check 2: Render configuration
console.log('\n📋 Checking Render configuration...');
if (fs.existsSync('shared-backend/render.yaml')) {
    try {
        const renderConfig = fs.readFileSync('shared-backend/render.yaml', 'utf8');
        
        // Check for placeholder values
        const placeholders = [
            'YOUR_ACTUAL_PRIVATE_KEY_ID',
            'YOUR_ACTUAL_PRIVATE_KEY',
            'YOUR_ACTUAL_CLIENT_ID',
            'firebase-adminsdk-xxxxx@clutch-a2f49.iam.gserviceaccount.com'
        ];
        
        let hasPlaceholders = false;
        placeholders.forEach(placeholder => {
            if (renderConfig.includes(placeholder)) {
                console.log(`⚠️  Found placeholder: ${placeholder}`);
                hasPlaceholders = true;
            }
        });
        
        if (!hasPlaceholders) {
            console.log('✅ Render configuration looks complete');
        } else {
            console.log('❌ Render configuration has placeholder values that need to be updated');
        }
        
        // Check for required environment variables
        const requiredEnvVars = [
            'NODE_ENV',
            'PORT',
            'FIREBASE_ADMIN_PROJECT_ID',
            'MONGODB_URI',
            'PLATFORM_URL',
            'CORS_ORIGIN'
        ];
        
        requiredEnvVars.forEach(envVar => {
            if (renderConfig.includes(envVar)) {
                console.log(`✅ ${envVar} configured`);
            } else {
                console.log(`❌ ${envVar} missing`);
            }
        });
        
    } catch (error) {
        console.log(`❌ Error reading render.yaml: ${error.message}`);
    }
}

// Check 3: Package.json scripts
console.log('\n📦 Checking package.json configuration...');
if (fs.existsSync('shared-backend/package.json')) {
    try {
        const packageJson = JSON.parse(fs.readFileSync('shared-backend/package.json', 'utf8'));
        
        if (packageJson.scripts && packageJson.scripts.start) {
            console.log(`✅ Start script: ${packageJson.scripts.start}`);
        } else {
            console.log('❌ Start script missing');
        }
        
        if (packageJson.engines && packageJson.engines.node) {
            console.log(`✅ Node.js version: ${packageJson.engines.node}`);
        } else {
            console.log('⚠️  Node.js version not specified');
        }
        
    } catch (error) {
        console.log(`❌ Error reading package.json: ${error.message}`);
    }
}

// Check 4: Environment variables
console.log('\n🔐 Checking environment variables...');
if (fs.existsSync('shared-backend/env.example')) {
    console.log('✅ Environment template found');
} else {
    console.log('⚠️  Environment template not found');
}

// Summary
console.log('\n=====================================');
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('=====================================');

if (structureOk) {
    console.log('✅ Project structure: READY');
} else {
    console.log('❌ Project structure: NEEDS FIXING');
}

console.log('\n🚀 NEXT STEPS:');
console.log('1. Update render.yaml with real Firebase credentials');
console.log('2. Go to https://render.com and create new Web Service');
console.log('3. Connect to your clutch-main repository');
console.log('4. Set root directory to: shared-backend');
console.log('5. Deploy and test endpoints');

console.log('\n📚 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md');
console.log('🔧 Run the deployment script: deploy-render-updated.bat or deploy-render-updated.ps1');
