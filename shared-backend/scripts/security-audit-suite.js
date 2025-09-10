#!/usr/bin/env node

/**
 * 🔒 Security Audit & Penetration Testing Suite for Clutch Platform
 * Comprehensive security testing and vulnerability assessment
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SecurityAuditSuite {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      vulnerabilities: [],
      securityScore: 0,
      recommendations: []
    };
    this.authTokens = {
      admin: null,
      user: null,
      partner: null
    };
  }

  async run() {
    console.log('🔒 Starting Comprehensive Security Audit Suite...');
    console.log(`📍 Testing against: ${this.baseUrl}`);
    
    try {
      // Phase 1: Authentication & Authorization Testing
      await this.testAuthenticationSecurity();
      
      // Phase 2: Input Validation & Injection Testing
      await this.testInputValidationSecurity();
      
      // Phase 3: Session Management Testing
      await this.testSessionSecurity();
      
      // Phase 4: API Security Testing
      await this.testAPISecurity();
      
      // Phase 5: Data Protection Testing
      await this.testDataProtection();
      
      // Phase 6: Rate Limiting Testing
      await this.testRateLimiting();
      
      // Phase 7: CORS & Headers Testing
      await this.testCORSAndHeaders();
      
      // Phase 8: Business Logic Testing
      await this.testBusinessLogicSecurity();
      
      // Generate comprehensive security report
      await this.generateSecurityReport();
      
    } catch (error) {
      console.error('❌ Security audit suite failed:', error.message);
      process.exit(1);
    }
  }

  async testAuthenticationSecurity() {
    console.log('\n🔐 Phase 1: Authentication & Authorization Security Testing...');
    
    const tests = [
      {
        name: 'Weak Password Policy Test',
        test: () => this.testWeakPasswordPolicy(),
        category: 'authentication'
      },
      {
        name: 'Brute Force Protection Test',
        test: () => this.testBruteForceProtection(),
        category: 'authentication'
      },
      {
        name: 'JWT Token Security Test',
        test: () => this.testJWTTokenSecurity(),
        category: 'authentication'
      },
      {
        name: 'Role-Based Access Control Test',
        test: () => this.testRoleBasedAccessControl(),
        category: 'authorization'
      },
      {
        name: 'Privilege Escalation Test',
        test: () => this.testPrivilegeEscalation(),
        category: 'authorization'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testInputValidationSecurity() {
    console.log('\n🛡️ Phase 2: Input Validation & Injection Security Testing...');
    
    const tests = [
      {
        name: 'SQL Injection Test',
        test: () => this.testSQLInjection(),
        category: 'injection'
      },
      {
        name: 'XSS Prevention Test',
        test: () => this.testXSSPrevention(),
        category: 'injection'
      },
      {
        name: 'NoSQL Injection Test',
        test: () => this.testNoSQLInjection(),
        category: 'injection'
      },
      {
        name: 'Command Injection Test',
        test: () => this.testCommandInjection(),
        category: 'injection'
      },
      {
        name: 'File Upload Security Test',
        test: () => this.testFileUploadSecurity(),
        category: 'injection'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testSessionSecurity() {
    console.log('\n🔑 Phase 3: Session Management Security Testing...');
    
    const tests = [
      {
        name: 'Session Fixation Test',
        test: () => this.testSessionFixation(),
        category: 'session'
      },
      {
        name: 'Session Timeout Test',
        test: () => this.testSessionTimeout(),
        category: 'session'
      },
      {
        name: 'Concurrent Session Test',
        test: () => this.testConcurrentSessions(),
        category: 'session'
      },
      {
        name: 'Session Invalidation Test',
        test: () => this.testSessionInvalidation(),
        category: 'session'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testAPISecurity() {
    console.log('\n🌐 Phase 4: API Security Testing...');
    
    const tests = [
      {
        name: 'API Rate Limiting Test',
        test: () => this.testAPIRateLimiting(),
        category: 'api'
      },
      {
        name: 'API Versioning Security Test',
        test: () => this.testAPIVersioningSecurity(),
        category: 'api'
      },
      {
        name: 'API Parameter Pollution Test',
        test: () => this.testAPIParameterPollution(),
        category: 'api'
      },
      {
        name: 'API Mass Assignment Test',
        test: () => this.testAPIMassAssignment(),
        category: 'api'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testDataProtection() {
    console.log('\n🔒 Phase 5: Data Protection Security Testing...');
    
    const tests = [
      {
        name: 'Data Encryption Test',
        test: () => this.testDataEncryption(),
        category: 'data'
      },
      {
        name: 'PII Exposure Test',
        test: () => this.testPIIExposure(),
        category: 'data'
      },
      {
        name: 'Data Leakage Test',
        test: () => this.testDataLeakage(),
        category: 'data'
      },
      {
        name: 'Secure Communication Test',
        test: () => this.testSecureCommunication(),
        category: 'data'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️ Phase 6: Rate Limiting Security Testing...');
    
    const tests = [
      {
        name: 'Authentication Rate Limiting Test',
        test: () => this.testAuthenticationRateLimiting(),
        category: 'rate_limiting'
      },
      {
        name: 'API Endpoint Rate Limiting Test',
        test: () => this.testAPIEndpointRateLimiting(),
        category: 'rate_limiting'
      },
      {
        name: 'IP-Based Rate Limiting Test',
        test: () => this.testIPBasedRateLimiting(),
        category: 'rate_limiting'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testCORSAndHeaders() {
    console.log('\n🌍 Phase 7: CORS & Security Headers Testing...');
    
    const tests = [
      {
        name: 'CORS Configuration Test',
        test: () => this.testCORSConfiguration(),
        category: 'headers'
      },
      {
        name: 'Security Headers Test',
        test: () => this.testSecurityHeaders(),
        category: 'headers'
      },
      {
        name: 'Content Security Policy Test',
        test: () => this.testContentSecurityPolicy(),
        category: 'headers'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  async testBusinessLogicSecurity() {
    console.log('\n💼 Phase 8: Business Logic Security Testing...');
    
    const tests = [
      {
        name: 'IDOR Vulnerability Test',
        test: () => this.testIDORVulnerability(),
        category: 'business_logic'
      },
      {
        name: 'Business Rule Bypass Test',
        test: () => this.testBusinessRuleBypass(),
        category: 'business_logic'
      },
      {
        name: 'Race Condition Test',
        test: () => this.testRaceCondition(),
        category: 'business_logic'
      }
    ];

    for (const test of tests) {
      await this.runSecurityTest(test);
    }
  }

  // Individual Security Test Implementations
  async testWeakPasswordPolicy() {
    const weakPasswords = ['123', 'password', 'admin', 'test'];
    let vulnerabilities = 0;
    
    for (const password of weakPasswords) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/v1/auth/register`, {
          email: `test${Date.now()}@example.com`,
          password: password,
          name: 'Test User'
        });
        
        if (response.status === 201) {
          vulnerabilities++;
        }
      } catch (error) {
        // Expected to fail for weak passwords
      }
    }
    
    return {
      passed: vulnerabilities === 0,
      details: `Weak password policy test: ${vulnerabilities} weak passwords accepted`,
      severity: vulnerabilities > 0 ? 'HIGH' : 'LOW'
    };
  }

  async testBruteForceProtection() {
    const attempts = 20;
    let blockedAttempts = 0;
    
    for (let i = 0; i < attempts; i++) {
      try {
        await axios.post(`${this.baseUrl}/api/v1/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response?.status === 429 || error.response?.status === 403) {
          blockedAttempts++;
        }
      }
    }
    
    const protectionLevel = blockedAttempts / attempts;
    return {
      passed: protectionLevel > 0.5,
      details: `Brute force protection: ${(protectionLevel * 100).toFixed(1)}% of attempts blocked`,
      severity: protectionLevel < 0.5 ? 'HIGH' : 'LOW'
    };
  }

  async testJWTTokenSecurity() {
    try {
      // Test JWT token structure
      const response = await axios.post(`${this.baseUrl}/api/v1/auth/login`, {
        email: 'admin@clutch.com',
        password: 'admin123'
      });
      
      const token = response.data.data.token;
      const tokenParts = token.split('.');
      
      if (tokenParts.length !== 3) {
        return {
          passed: false,
          details: 'Invalid JWT token structure',
          severity: 'HIGH'
        };
      }
      
      // Test token expiration
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      const hasExpiration = payload.exp && payload.iat;
      
      return {
        passed: hasExpiration,
        details: hasExpiration ? 'JWT token has proper expiration' : 'JWT token missing expiration',
        severity: hasExpiration ? 'LOW' : 'MEDIUM'
      };
      
    } catch (error) {
      return {
        passed: false,
        details: 'Failed to test JWT token security',
        severity: 'MEDIUM'
      };
    }
  }

  async testRoleBasedAccessControl() {
    try {
      // Get user token
      const userResponse = await axios.post(`${this.baseUrl}/api/v1/clutch-mobile/auth/login`, {
        email: 'john.doe@email.com',
        password: 'user123'
      });
      
      const userToken = userResponse.data.data.token;
      
      // Try to access admin endpoint
      try {
        await axios.get(`${this.baseUrl}/api/v1/hr/employees`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        return {
          passed: false,
          details: 'User was able to access admin endpoint',
          severity: 'HIGH'
        };
      } catch (error) {
        if (error.response?.status === 403) {
          return {
            passed: true,
            details: 'Role-based access control working correctly',
            severity: 'LOW'
          };
        }
      }
      
    } catch (error) {
      return {
        passed: false,
        details: 'Failed to test role-based access control',
        severity: 'MEDIUM'
      };
    }
  }

  async testSQLInjection() {
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--"
    ];
    
    let vulnerabilities = 0;
    
    for (const payload of sqlInjectionPayloads) {
      try {
        const response = await axios.get(`${this.baseUrl}/api/v1/users/search?q=${encodeURIComponent(payload)}`);
        
        // Check for suspicious responses
        if (response.data && response.data.length > 100) {
          vulnerabilities++;
        }
      } catch (error) {
        // Expected to fail for SQL injection attempts
      }
    }
    
    return {
      passed: vulnerabilities === 0,
      details: `SQL injection test: ${vulnerabilities} potential vulnerabilities detected`,
      severity: vulnerabilities > 0 ? 'CRITICAL' : 'LOW'
    };
  }

  async testXSSPrevention() {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>'
    ];
    
    let vulnerabilities = 0;
    
    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(`${this.baseUrl}/api/v1/feedback`, {
          message: payload,
          rating: 5
        });
        
        // Check if payload was stored without sanitization
        if (response.status === 201) {
          const storedResponse = await axios.get(`${this.baseUrl}/api/v1/feedback`);
          if (storedResponse.data.some(item => item.message.includes(payload))) {
            vulnerabilities++;
          }
        }
      } catch (error) {
        // Expected to fail for XSS attempts
      }
    }
    
    return {
      passed: vulnerabilities === 0,
      details: `XSS prevention test: ${vulnerabilities} potential vulnerabilities detected`,
      severity: vulnerabilities > 0 ? 'HIGH' : 'LOW'
    };
  }

  async testRateLimiting() {
    const endpoint = '/api/v1/auth/login';
    const attempts = 15;
    let blockedAttempts = 0;
    
    for (let i = 0; i < attempts; i++) {
      try {
        await axios.post(`${this.baseUrl}${endpoint}`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        if (error.response?.status === 429) {
          blockedAttempts++;
        }
      }
    }
    
    const protectionLevel = blockedAttempts / attempts;
    return {
      passed: protectionLevel > 0.3,
      details: `Rate limiting test: ${(protectionLevel * 100).toFixed(1)}% of attempts blocked`,
      severity: protectionLevel < 0.3 ? 'MEDIUM' : 'LOW'
    };
  }

  async testSecurityHeaders() {
    try {
      const response = await axios.get(`${this.baseUrl}/health-enhanced`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      let missingHeaders = 0;
      for (const header of requiredHeaders) {
        if (!headers[header]) {
          missingHeaders++;
        }
      }
      
      return {
        passed: missingHeaders === 0,
        details: `Security headers test: ${missingHeaders} required headers missing`,
        severity: missingHeaders > 0 ? 'MEDIUM' : 'LOW'
      };
      
    } catch (error) {
      return {
        passed: false,
        details: 'Failed to test security headers',
        severity: 'MEDIUM'
      };
    }
  }

  async runSecurityTest(test) {
    this.results.totalTests++;
    
    try {
      console.log(`🧪 Running: ${test.name}`);
      const result = await test.test();
      
      if (result.passed) {
        this.results.passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        this.results.failed++;
        console.log(`❌ ${test.name} - FAILED (${result.severity})`);
        
        this.results.vulnerabilities.push({
          test: test.name,
          category: test.category,
          details: result.details,
          severity: result.severity
        });
      }
      
    } catch (error) {
      this.results.failed++;
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      
      this.results.vulnerabilities.push({
        test: test.name,
        category: test.category,
        details: `Test execution failed: ${error.message}`,
        severity: 'MEDIUM'
      });
    }
  }

  async generateSecurityReport() {
    console.log('\n📊 Generating Comprehensive Security Report...');
    
    // Calculate security score
    this.results.securityScore = Math.round((this.results.passed / this.results.totalTests) * 100);
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        totalTests: this.results.totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        securityScore: this.results.securityScore
      },
      vulnerabilities: this.results.vulnerabilities,
      recommendations: this.generateSecurityRecommendations(),
      riskAssessment: this.assessSecurityRisk()
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, 'test-results', `security-audit-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n🎯 SECURITY AUDIT RESULTS SUMMARY');
    console.log('==================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Security Score: ${report.summary.securityScore}/100 🔒`);
    console.log(`\n📁 Detailed report saved to: ${reportPath}`);
    
    // Vulnerability summary
    if (report.vulnerabilities.length > 0) {
      console.log(`\n🚨 VULNERABILITIES DETECTED`);
      console.log('============================');
      
      const criticalVulns = report.vulnerabilities.filter(v => v.severity === 'CRITICAL');
      const highVulns = report.vulnerabilities.filter(v => v.severity === 'HIGH');
      const mediumVulns = report.vulnerabilities.filter(v => v.severity === 'MEDIUM');
      
      if (criticalVulns.length > 0) {
        console.log(`CRITICAL: ${criticalVulns.length} vulnerabilities`);
      }
      if (highVulns.length > 0) {
        console.log(`HIGH: ${highVulns.length} vulnerabilities`);
      }
      if (mediumVulns.length > 0) {
        console.log(`MEDIUM: ${mediumVulns.length} vulnerabilities`);
      }
    }
    
    // Risk assessment
    console.log(`\n⚠️ RISK ASSESSMENT`);
    console.log('==================');
    console.log(`Overall Risk Level: ${report.riskAssessment.level}`);
    console.log(`Risk Score: ${report.riskAssessment.score}/10`);
    console.log(`Description: ${report.riskAssessment.description}`);
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 SECURITY RECOMMENDATIONS`);
      console.log('============================');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  generateSecurityRecommendations() {
    const recommendations = [];
    
    // Analyze vulnerabilities by category
    const categories = {};
    this.results.vulnerabilities.forEach(vuln => {
      if (!categories[vuln.category]) {
        categories[vuln.category] = [];
      }
      categories[vuln.category].push(vuln);
    });
    
    // Generate category-specific recommendations
    if (categories.authentication) {
      recommendations.push('Implement stronger authentication policies and multi-factor authentication');
    }
    
    if (categories.injection) {
      recommendations.push('Strengthen input validation and implement proper sanitization');
    }
    
    if (categories.authorization) {
      recommendations.push('Review and strengthen role-based access control implementation');
    }
    
    if (categories.session) {
      recommendations.push('Improve session management and implement proper session security');
    }
    
    if (categories.api) {
      recommendations.push('Enhance API security with better rate limiting and validation');
    }
    
    if (categories.data) {
      recommendations.push('Implement data encryption and improve data protection measures');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Security posture is strong - continue monitoring and regular testing');
    }
    
    return recommendations;
  }

  assessSecurityRisk() {
    const criticalVulns = this.results.vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highVulns = this.results.vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumVulns = this.results.vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    
    let riskScore = 0;
    let riskLevel = 'LOW';
    let description = 'Security posture is good with minimal risks';
    
    // Calculate risk score (0-10)
    riskScore += criticalVulns * 3;
    riskScore += highVulns * 2;
    riskScore += mediumVulns * 1;
    
    // Determine risk level
    if (riskScore >= 8) {
      riskLevel = 'CRITICAL';
      description = 'Immediate action required - critical security vulnerabilities detected';
    } else if (riskScore >= 5) {
      riskLevel = 'HIGH';
      description = 'High risk - significant security improvements needed';
    } else if (riskScore >= 3) {
      riskLevel = 'MEDIUM';
      description = 'Medium risk - some security improvements recommended';
    } else if (riskScore >= 1) {
      riskLevel = 'LOW';
      description = 'Low risk - minor security improvements suggested';
    }
    
    return {
      score: Math.min(riskScore, 10),
      level: riskLevel,
      description: description
    };
  }
}

// Run the security audit suite
if (require.main === module) {
  const securitySuite = new SecurityAuditSuite();
  securitySuite.run().catch(console.error);
}

module.exports = SecurityAuditSuite;
