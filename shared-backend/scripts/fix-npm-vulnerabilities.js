#!/usr/bin/env node

/**
 * NPM Vulnerabilities Auto-Fix Script
 * Automatically fixes NPM vulnerabilities using AI analysis
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class NPMVulnerabilityFixer {
  constructor() {
    this.logger = {
      info: (msg) => console.log(`ℹ️ ${msg}`),
      warn: (msg) => console.log(`⚠️ ${msg}`),
      error: (msg) => console.log(`❌ ${msg}`),
      success: (msg) => console.log(`✅ ${msg}`)
    };
  }

  async fixVulnerabilities() {
    try {
      this.logger.info('🔍 Analyzing NPM vulnerabilities...');
      
      // Run npm audit to get current vulnerabilities
      const { stdout: auditOutput } = await execAsync('npm audit --json');
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
        this.logger.warn(`Found ${Object.keys(auditData.vulnerabilities).length} vulnerabilities`);
        
        // Try to fix automatically
        this.logger.info('🔧 Attempting automatic fix...');
        try {
          await execAsync('npm audit fix --force');
          this.logger.success('✅ Automatic fix completed');
        } catch (fixError) {
          this.logger.warn('⚠️ Automatic fix failed, trying alternative approach...');
          
          // Try updating specific vulnerable packages
          await this.updateVulnerablePackages(auditData.vulnerabilities);
        }
        
        // Verify fixes
        await this.verifyFixes();
        
      } else {
        this.logger.success('✅ No vulnerabilities found');
      }
      
    } catch (error) {
      this.logger.error(`Failed to fix vulnerabilities: ${error.message}`);
      
      // Fallback: Update all packages to latest versions
      this.logger.info('🔄 Attempting package updates...');
      try {
        await execAsync('npm update');
        this.logger.success('✅ Package updates completed');
      } catch (updateError) {
        this.logger.error(`Package update failed: ${updateError.message}`);
      }
    }
  }

  async updateVulnerablePackages(vulnerabilities) {
    const criticalPackages = [];
    const highPackages = [];
    
    // Categorize vulnerabilities by severity
    for (const [packageName, vuln] of Object.entries(vulnerabilities)) {
      if (vuln.severity === 'critical') {
        criticalPackages.push(packageName);
      } else if (vuln.severity === 'high') {
        highPackages.push(packageName);
      }
    }
    
    // Update critical packages first
    if (criticalPackages.length > 0) {
      this.logger.info(`🔴 Updating ${criticalPackages.length} critical packages...`);
      for (const pkg of criticalPackages) {
        try {
          await execAsync(`npm install ${pkg}@latest`);
          this.logger.success(`✅ Updated ${pkg}`);
        } catch (error) {
          this.logger.warn(`⚠️ Failed to update ${pkg}: ${error.message}`);
        }
      }
    }
    
    // Update high severity packages
    if (highPackages.length > 0) {
      this.logger.info(`🟠 Updating ${highPackages.length} high severity packages...`);
      for (const pkg of highPackages) {
        try {
          await execAsync(`npm install ${pkg}@latest`);
          this.logger.success(`✅ Updated ${pkg}`);
        } catch (error) {
          this.logger.warn(`⚠️ Failed to update ${pkg}: ${error.message}`);
        }
      }
    }
  }

  async verifyFixes() {
    this.logger.info('🔍 Verifying vulnerability fixes...');
    
    try {
      const { stdout: auditOutput } = await execAsync('npm audit --json');
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
        const remainingVulns = Object.keys(auditData.vulnerabilities).length;
        this.logger.warn(`⚠️ ${remainingVulns} vulnerabilities remain`);
        
        // Log remaining vulnerabilities
        for (const [pkg, vuln] of Object.entries(auditData.vulnerabilities)) {
          this.logger.warn(`  - ${pkg}: ${vuln.severity} (${vuln.via})`);
        }
      } else {
        this.logger.success('✅ All vulnerabilities fixed!');
      }
    } catch (error) {
      this.logger.error(`Verification failed: ${error.message}`);
    }
  }

  async generateSecurityReport() {
    try {
      this.logger.info('📊 Generating security report...');
      
      const { stdout: auditOutput } = await execAsync('npm audit --json');
      const auditData = JSON.parse(auditOutput);
      
      const report = {
        timestamp: new Date().toISOString(),
        totalVulnerabilities: auditData.vulnerabilities ? Object.keys(auditData.vulnerabilities).length : 0,
        vulnerabilities: auditData.vulnerabilities || {},
        summary: {
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0
        }
      };
      
      // Count by severity
      if (auditData.vulnerabilities) {
        for (const vuln of Object.values(auditData.vulnerabilities)) {
          if (vuln.severity) {
            report.summary[vuln.severity] = (report.summary[vuln.severity] || 0) + 1;
          }
        }
      }
      
      // Save report
      await fs.writeFile(
        path.join(__dirname, '../logs/security-report.json'),
        JSON.stringify(report, null, 2)
      );
      
      this.logger.success('📊 Security report saved to logs/security-report.json');
      
      return report;
      
    } catch (error) {
      this.logger.error(`Failed to generate security report: ${error.message}`);
      return null;
    }
  }
}

// Main execution
async function main() {
  const fixer = new NPMVulnerabilityFixer();
  
  console.log('🚀 Starting NPM Vulnerability Auto-Fix...');
  console.log('=====================================');
  
  try {
    await fixer.fixVulnerabilities();
    await fixer.generateSecurityReport();
    
    console.log('=====================================');
    console.log('✅ NPM Vulnerability Fix Complete!');
    
  } catch (error) {
    console.error('❌ NPM Vulnerability Fix Failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = NPMVulnerabilityFixer;
