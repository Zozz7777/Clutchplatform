#!/usr/bin/env node

/**
 * Production Deployment Script
 * Handles pre-deployment checks and optimizations
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../config/logger');

class ProductionDeployment {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  async run() {
    console.log('🚀 Starting Production Deployment Process...\n');
    
    try {
      await this.validateEnvironment();
      await this.runPreDeploymentChecks();
      await this.optimizeForProduction();
      await this.generateDeploymentReport();
      
      if (this.errors.length > 0) {
        console.error('❌ Deployment failed with errors:');
        this.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
      
      if (this.warnings.length > 0) {
        console.warn('⚠️  Deployment completed with warnings:');
        this.warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
      
      console.log('✅ Production deployment ready!');
      
    } catch (error) {
      console.error('❌ Deployment process failed:', error.message);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'NODE_ENV'
    ];
    
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      this.errors.push(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (process.env.NODE_ENV !== 'production') {
      this.warnings.push('NODE_ENV is not set to "production"');
    }
    
    this.checks.push('Environment validation completed');
  }

  async runPreDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if all required files exist
    const requiredFiles = [
      'server.js',
      'package.json',
      'config/production.js',
      'middleware/production-optimizations.js',
      'middleware/production-logging.js'
    ];
    
    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(__dirname, '..', file));
        this.checks.push(`Required file exists: ${file}`);
      } catch (error) {
        this.errors.push(`Missing required file: ${file}`);
      }
    }
    
    // Check package.json for production dependencies
    try {
      const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));
      
      if (!packageJson.dependencies) {
        this.errors.push('No dependencies found in package.json');
      }
      
      // Check for development dependencies in production
      if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
        this.warnings.push('Development dependencies found - ensure they are not installed in production');
      }
      
      this.checks.push('Package.json validation completed');
    } catch (error) {
      this.errors.push('Failed to read package.json');
    }
    
    // Check for test files in production
    try {
      const testFiles = await this.findTestFiles();
      if (testFiles.length > 0) {
        this.warnings.push(`Test files found in production build: ${testFiles.join(', ')}`);
      }
    } catch (error) {
      this.warnings.push('Could not check for test files');
    }
  }

  async optimizeForProduction() {
    console.log('⚡ Optimizing for production...');
    
    // Remove development files
    await this.removeDevelopmentFiles();
    
    // Optimize package.json
    await this.optimizePackageJson();
    
    // Create production startup script
    await this.createProductionStartScript();
    
    this.checks.push('Production optimization completed');
  }

  async removeDevelopmentFiles() {
    const devFiles = [
      'test-*.js',
      '*.test.js',
      '*.spec.js',
      'coverage/',
      'logs/development.log'
    ];
    
    for (const pattern of devFiles) {
      try {
        const files = await this.findFiles(pattern);
        for (const file of files) {
          await fs.unlink(file);
          this.checks.push(`Removed development file: ${file}`);
        }
      } catch (error) {
        // File might not exist, which is fine
      }
    }
  }

  async optimizePackageJson() {
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      
      // Add production scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'start:prod': 'NODE_ENV=production node server.js',
        'pm2:start': 'pm2 start ecosystem.config.js',
        'pm2:stop': 'pm2 stop ecosystem.config.js',
        'pm2:restart': 'pm2 restart ecosystem.config.js'
      };
      
      // Remove devDependencies for production
      if (packageJson.devDependencies) {
        delete packageJson.devDependencies;
      }
      
      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      this.checks.push('Package.json optimized for production');
    } catch (error) {
      this.warnings.push('Could not optimize package.json');
    }
  }

  async createProductionStartScript() {
    const startScript = `#!/bin/bash
# Production Start Script for Clutch Platform

echo "🚀 Starting Clutch Platform in Production Mode..."

# Set production environment
export NODE_ENV=production

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application
node server.js
`;
    
    try {
      await fs.writeFile(path.join(__dirname, '..', 'start-production.sh'), startScript);
      await fs.chmod(path.join(__dirname, '..', 'start-production.sh'), '755');
      this.checks.push('Production start script created');
    } catch (error) {
      this.warnings.push('Could not create production start script');
    }
  }

  async createPM2Ecosystem() {
    const ecosystemConfig = {
      apps: [{
        name: 'clutch-platform',
        script: 'server.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
          PORT: 5000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 5000
        },
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        max_memory_restart: '1G',
        node_args: '--max-old-space-size=1024',
        watch: false,
        ignore_watch: ['node_modules', 'logs'],
        max_restarts: 10,
        min_uptime: '10s'
      }]
    };
    
    try {
      await fs.writeFile(
        path.join(__dirname, '..', 'ecosystem.config.js'),
        `module.exports = ${JSON.stringify(ecosystemConfig, null, 2)};`
      );
      this.checks.push('PM2 ecosystem configuration created');
    } catch (error) {
      this.warnings.push('Could not create PM2 ecosystem configuration');
    }
  }

  async generateDeploymentReport() {
    console.log('📊 Generating deployment report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: this.checks,
      warnings: this.warnings,
      errors: this.errors,
      status: this.errors.length > 0 ? 'FAILED' : this.warnings.length > 0 ? 'WARNING' : 'SUCCESS',
      recommendations: this.generateRecommendations()
    };
    
    try {
      await fs.writeFile(
        path.join(__dirname, '..', 'deployment-report.json'),
        JSON.stringify(report, null, 2)
      );
      this.checks.push('Deployment report generated');
    } catch (error) {
      this.warnings.push('Could not generate deployment report');
    }
    
    // Print summary
    console.log('\n📋 Deployment Summary:');
    console.log(`  Status: ${report.status}`);
    console.log(`  Checks: ${this.checks.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Errors: ${this.errors.length}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.warnings.length > 0) {
      recommendations.push('Review warnings before deployment');
    }
    
    recommendations.push('Set up monitoring and alerting');
    recommendations.push('Configure backup strategies');
    recommendations.push('Set up SSL certificates');
    recommendations.push('Configure load balancing if needed');
    recommendations.push('Set up log aggregation');
    
    return recommendations;
  }

  async findTestFiles() {
    // This is a simplified version - in a real implementation,
    // you'd use a proper file globbing library
    return [];
  }

  async findFiles(pattern) {
    // This is a simplified version - in a real implementation,
    // you'd use a proper file globbing library
    return [];
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployment = new ProductionDeployment();
  deployment.run().catch(console.error);
}

module.exports = ProductionDeployment;
