#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Comparing Frontend vs Backend API Endpoints...\n');

// Load the audit results
const frontendAudit = JSON.parse(fs.readFileSync('frontend-endpoints-audit.json', 'utf8'));
const backendAudit = JSON.parse(fs.readFileSync('backend-endpoints-audit.json', 'utf8'));

// Helper function to normalize endpoint paths
function normalizeEndpoint(endpoint) {
  // Remove query parameters
  endpoint = endpoint.split('?')[0];
  
  // Remove template variables like ${id}, ${userId}, etc.
  endpoint = endpoint.replace(/\$\{[^}]+\}/g, ':id');
  
  // Remove protocol and domain
  endpoint = endpoint.replace(/^https?:\/\/[^\/]+/, '');
  
  // Ensure it starts with /
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint;
  }
  
  // Remove trailing slash
  endpoint = endpoint.replace(/\/$/, '');
  
  return endpoint;
}

// Helper function to extract method from backend endpoint
function extractMethod(endpoint) {
  const parts = endpoint.split(' ');
  return parts[0] || 'GET';
}

// Helper function to extract path from backend endpoint
function extractPath(endpoint) {
  const parts = endpoint.split(' ');
  return parts[1] || endpoint;
}

// Normalize frontend endpoints
const frontendEndpoints = new Set();
frontendAudit.allEndpoints.forEach(endpoint => {
  const normalized = normalizeEndpoint(endpoint);
  if (normalized && normalized !== '/') {
    frontendEndpoints.add(normalized);
  }
});

// Normalize backend endpoints
const backendEndpoints = new Set();
const backendEndpointsByMethod = {};

backendAudit.allEndpoints.forEach(endpoint => {
  const method = extractMethod(endpoint);
  const path = extractPath(endpoint);
  const normalized = normalizeEndpoint(path);
  
  if (normalized && normalized !== '/') {
    backendEndpoints.add(normalized);
    
    if (!backendEndpointsByMethod[method]) {
      backendEndpointsByMethod[method] = new Set();
    }
    backendEndpointsByMethod[method].add(normalized);
  }
});

// Find missing endpoints
const missingEndpoints = [];
const availableEndpoints = [];

frontendEndpoints.forEach(frontendEndpoint => {
  if (backendEndpoints.has(frontendEndpoint)) {
    availableEndpoints.push(frontendEndpoint);
  } else {
    missingEndpoints.push(frontendEndpoint);
  }
});

// Categorize missing endpoints
const missingByCategory = {
  auth: [],
  admin: [],
  dashboard: [],
  analytics: [],
  monitoring: [],
  performance: [],
  errors: [],
  feedback: [],
  email: [],
  users: [],
  other: []
};

missingEndpoints.forEach(endpoint => {
  if (endpoint.includes('/auth/')) {
    missingByCategory.auth.push(endpoint);
  } else if (endpoint.includes('/admin/')) {
    missingByCategory.admin.push(endpoint);
  } else if (endpoint.includes('/dashboard/')) {
    missingByCategory.dashboard.push(endpoint);
  } else if (endpoint.includes('/analytics/')) {
    missingByCategory.analytics.push(endpoint);
  } else if (endpoint.includes('/monitoring/')) {
    missingByCategory.monitoring.push(endpoint);
  } else if (endpoint.includes('/performance/')) {
    missingByCategory.performance.push(endpoint);
  } else if (endpoint.includes('/errors/')) {
    missingByCategory.errors.push(endpoint);
  } else if (endpoint.includes('/feedback/')) {
    missingByCategory.feedback.push(endpoint);
  } else if (endpoint.includes('/email/') || endpoint.includes('/clutch-email/')) {
    missingByCategory.email.push(endpoint);
  } else if (endpoint.includes('/users/')) {
    missingByCategory.users.push(endpoint);
  } else {
    missingByCategory.other.push(endpoint);
  }
});

// Display results
console.log('📊 ENDPOINT COMPARISON RESULTS\n');
console.log('='.repeat(50));

console.log(`\n📈 SUMMARY:`);
console.log(`   • Frontend endpoints: ${frontendEndpoints.size}`);
console.log(`   • Backend endpoints: ${backendEndpoints.size}`);
console.log(`   • Available endpoints: ${availableEndpoints.length}`);
console.log(`   • Missing endpoints: ${missingEndpoints.length}`);
console.log(`   • Coverage: ${((availableEndpoints.length / frontendEndpoints.size) * 100).toFixed(1)}%`);

if (missingEndpoints.length > 0) {
  console.log(`\n❌ MISSING ENDPOINTS (${missingEndpoints.length}):`);
  console.log('='.repeat(50));
  
  Object.entries(missingByCategory).forEach(([category, endpoints]) => {
    if (endpoints.length > 0) {
      console.log(`\n📂 ${category.toUpperCase()} (${endpoints.length} missing):`);
      endpoints.forEach(endpoint => {
        console.log(`   ${endpoint}`);
      });
    }
  });
} else {
  console.log(`\n✅ ALL ENDPOINTS AVAILABLE!`);
}

console.log(`\n✅ AVAILABLE ENDPOINTS (${availableEndpoints.length}):`);
console.log('='.repeat(50));
availableEndpoints.slice(0, 20).forEach(endpoint => {
  console.log(`   ${endpoint}`);
});
if (availableEndpoints.length > 20) {
  console.log(`   ... and ${availableEndpoints.length - 20} more`);
}

// Backend method breakdown
console.log(`\n🔧 BACKEND METHODS BREAKDOWN:`);
console.log('='.repeat(50));
Object.entries(backendEndpointsByMethod).forEach(([method, endpoints]) => {
  console.log(`   ${method}: ${endpoints.size} endpoints`);
});

// Save detailed comparison results
const comparisonResults = {
  summary: {
    frontendEndpoints: frontendEndpoints.size,
    backendEndpoints: backendEndpoints.size,
    availableEndpoints: availableEndpoints.length,
    missingEndpoints: missingEndpoints.length,
    coverage: ((availableEndpoints.length / frontendEndpoints.size) * 100).toFixed(1) + '%'
  },
  missingEndpoints: {
    total: missingEndpoints.length,
    byCategory: missingByCategory,
    all: missingEndpoints
  },
  availableEndpoints: {
    total: availableEndpoints.length,
    all: availableEndpoints
  },
  backendMethods: Object.fromEntries(
    Object.entries(backendEndpointsByMethod).map(([method, endpoints]) => [method, endpoints.size])
  ),
  frontendEndpoints: Array.from(frontendEndpoints),
  backendEndpoints: Array.from(backendEndpoints)
};

const outputFile = 'endpoint-comparison-results.json';
fs.writeFileSync(outputFile, JSON.stringify(comparisonResults, null, 2));

console.log(`\n💾 Detailed results saved to: ${outputFile}`);

// Generate recommendations
console.log(`\n💡 RECOMMENDATIONS:`);
console.log('='.repeat(50));

if (missingEndpoints.length > 0) {
  console.log(`\n🔧 PRIORITY ACTIONS:`);
  
  if (missingByCategory.auth.length > 0) {
    console.log(`   1. Implement ${missingByCategory.auth.length} missing auth endpoints (HIGH PRIORITY)`);
  }
  
  if (missingByCategory.admin.length > 0) {
    console.log(`   2. Implement ${missingByCategory.admin.length} missing admin endpoints (HIGH PRIORITY)`);
  }
  
  if (missingByCategory.dashboard.length > 0) {
    console.log(`   3. Implement ${missingByCategory.dashboard.length} missing dashboard endpoints (MEDIUM PRIORITY)`);
  }
  
  if (missingByCategory.analytics.length > 0) {
    console.log(`   4. Implement ${missingByCategory.analytics.length} missing analytics endpoints (MEDIUM PRIORITY)`);
  }
  
  if (missingByCategory.monitoring.length > 0) {
    console.log(`   5. Implement ${missingByCategory.monitoring.length} missing monitoring endpoints (LOW PRIORITY)`);
  }
  
  console.log(`\n📋 IMPLEMENTATION STEPS:`);
  console.log(`   1. Create missing route files in shared-backend/routes/`);
  console.log(`   2. Implement endpoint handlers with proper validation`);
  console.log(`   3. Add authentication middleware where needed`);
  console.log(`   4. Register routes in server.js`);
  console.log(`   5. Test endpoints with production test suite`);
} else {
  console.log(`\n🎉 EXCELLENT! All frontend endpoints are available in the backend.`);
  console.log(`   Your API coverage is 100%!`);
}

console.log(`\n✅ Endpoint comparison completed!`);
