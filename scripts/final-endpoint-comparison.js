const fs = require('fs');

// Final comprehensive endpoint comparison
// Compare 277 frontend API calls with actual 298 backend endpoints

function normalizeEndpoint(endpoint) {
  // Remove query parameters
  endpoint = endpoint.split('?')[0];
  
  // Remove trailing slash
  if (endpoint.endsWith('/') && endpoint.length > 1) {
    endpoint = endpoint.slice(0, -1);
  }
  
  // Handle template variables
  endpoint = endpoint.replace(/\$\{[^}]+\}/g, ':id');
  endpoint = endpoint.replace(/\$\{([^}]+)\}/g, ':$1');
  
  // Handle wildcards
  endpoint = endpoint.replace(/\*/g, '');
  
  // Clean up malformed endpoints
  endpoint = endpoint.replace(/\/\/+/g, '/');
  endpoint = endpoint.replace(/\/$/, '');
  
  return endpoint;
}

function resolveApiPrefix(endpoint) {
  // Replace ${apiPrefix} with /api/v1
  return endpoint.replace(/\$\{apiPrefix\}/g, '/api/v1');
}

function compareEndpoints() {
  console.log('🔍 Starting final comprehensive endpoint comparison...\n');
  
  // Load frontend API calls
  const frontendData = JSON.parse(fs.readFileSync('comprehensive-frontend-audit.json', 'utf8'));
  const frontendCalls = frontendData.allApiCalls;
  
  // Load actual available endpoints
  const backendData = JSON.parse(fs.readFileSync('actual-available-endpoints.json', 'utf8'));
  const backendEndpoints = backendData.endpoints;
  
  console.log(`📊 Frontend API calls found: ${frontendCalls.length}`);
  console.log(`📊 Backend endpoints available: ${backendEndpoints.length}`);
  
  // Normalize and resolve endpoints
  const normalizedFrontend = new Set();
  const normalizedBackend = new Set();
  
  // Process frontend calls
  frontendCalls.forEach(call => {
    const normalized = normalizeEndpoint(call);
    if (normalized && normalized.length > 1 && !normalized.includes('</code>') && !normalized.includes("'")) {
      normalizedFrontend.add(normalized);
    }
  });
  
  // Process backend endpoints
  backendEndpoints.forEach(endpoint => {
    const resolved = resolveApiPrefix(endpoint);
    const normalized = normalizeEndpoint(resolved);
    if (normalized && normalized.length > 1) {
      normalizedBackend.add(normalized);
    }
  });
  
  console.log(`📊 Normalized frontend calls: ${normalizedFrontend.size}`);
  console.log(`📊 Normalized backend endpoints: ${normalizedBackend.size}`);
  
  // Find matches and missing endpoints
  const availableEndpoints = [];
  const missingEndpoints = [];
  
  normalizedFrontend.forEach(frontendCall => {
    if (normalizedBackend.has(frontendCall)) {
      availableEndpoints.push(frontendCall);
    } else {
      missingEndpoints.push(frontendCall);
    }
  });
  
  // Categorize missing endpoints
  const categorizedMissing = {
    auth: [],
    admin: [],
    dashboard: [],
    analytics: [],
    monitoring: [],
    users: [],
    other: [],
    errors: [],
    api: []
  };
  
  missingEndpoints.forEach(endpoint => {
    if (endpoint.includes('/auth/')) {
      categorizedMissing.auth.push(endpoint);
    } else if (endpoint.includes('/admin/')) {
      categorizedMissing.admin.push(endpoint);
    } else if (endpoint.includes('/dashboard/')) {
      categorizedMissing.dashboard.push(endpoint);
    } else if (endpoint.includes('/analytics/')) {
      categorizedMissing.analytics.push(endpoint);
    } else if (endpoint.includes('/monitoring/')) {
      categorizedMissing.monitoring.push(endpoint);
    } else if (endpoint.includes('/users/')) {
      categorizedMissing.users.push(endpoint);
    } else if (endpoint.includes('/errors/')) {
      categorizedMissing.errors.push(endpoint);
    } else if (endpoint.includes('/api/')) {
      categorizedMissing.api.push(endpoint);
    } else {
      categorizedMissing.other.push(endpoint);
    }
  });
  
  // Calculate coverage
  const totalFrontend = normalizedFrontend.size;
  const totalAvailable = availableEndpoints.length;
  const totalMissing = missingEndpoints.length;
  const coverage = ((totalAvailable / totalFrontend) * 100).toFixed(1);
  
  const results = {
    summary: {
      totalFrontendCalls: totalFrontend,
      totalBackendEndpoints: normalizedBackend.size,
      availableEndpoints: totalAvailable,
      missingEndpoints: totalMissing,
      coverage: `${coverage}%`
    },
    availableEndpoints: availableEndpoints.sort(),
    missingEndpoints: missingEndpoints.sort(),
    categorizedMissing: categorizedMissing,
    detailedAnalysis: {
      auth: {
        total: categorizedMissing.auth.length + availableEndpoints.filter(e => e.includes('/auth/')).length,
        missing: categorizedMissing.auth.length,
        available: availableEndpoints.filter(e => e.includes('/auth/')).length
      },
      admin: {
        total: categorizedMissing.admin.length + availableEndpoints.filter(e => e.includes('/admin/')).length,
        missing: categorizedMissing.admin.length,
        available: availableEndpoints.filter(e => e.includes('/admin/')).length
      },
      dashboard: {
        total: categorizedMissing.dashboard.length + availableEndpoints.filter(e => e.includes('/dashboard/')).length,
        missing: categorizedMissing.dashboard.length,
        available: availableEndpoints.filter(e => e.includes('/dashboard/')).length
      },
      analytics: {
        total: categorizedMissing.analytics.length + availableEndpoints.filter(e => e.includes('/analytics/')).length,
        missing: categorizedMissing.analytics.length,
        available: availableEndpoints.filter(e => e.includes('/analytics/')).length
      },
      monitoring: {
        total: categorizedMissing.monitoring.length + availableEndpoints.filter(e => e.includes('/monitoring/')).length,
        missing: categorizedMissing.monitoring.length,
        available: availableEndpoints.filter(e => e.includes('/monitoring/')).length
      },
      users: {
        total: categorizedMissing.users.length + availableEndpoints.filter(e => e.includes('/users/')).length,
        missing: categorizedMissing.users.length,
        available: availableEndpoints.filter(e => e.includes('/users/')).length
      },
      api: {
        total: categorizedMissing.api.length + availableEndpoints.filter(e => e.includes('/api/')).length,
        missing: categorizedMissing.api.length,
        available: availableEndpoints.filter(e => e.includes('/api/')).length
      },
      other: {
        total: categorizedMissing.other.length + availableEndpoints.filter(e => !e.includes('/auth/') && !e.includes('/admin/') && !e.includes('/dashboard/') && !e.includes('/analytics/') && !e.includes('/monitoring/') && !e.includes('/users/') && !e.includes('/api/')).length,
        missing: categorizedMissing.other.length,
        available: availableEndpoints.filter(e => !e.includes('/auth/') && !e.includes('/admin/') && !e.includes('/dashboard/') && !e.includes('/analytics/') && !e.includes('/monitoring/') && !e.includes('/users/') && !e.includes('/api/')).length
      }
    }
  };
  
  // Save results
  fs.writeFileSync('final-endpoint-comparison.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 FINAL COMPREHENSIVE ENDPOINT COMPARISON RESULTS:');
  console.log('================================================');
  console.log(`📄 Total frontend API calls: ${totalFrontend}`);
  console.log(`🔗 Total backend endpoints: ${normalizedBackend.size}`);
  console.log(`✅ Available endpoints: ${totalAvailable}`);
  console.log(`❌ Missing endpoints: ${totalMissing}`);
  console.log(`📈 Coverage: ${coverage}%`);
  
  console.log('\n📋 Missing Endpoints by Category:');
  console.log(`   🔐 Auth: ${categorizedMissing.auth.length} missing`);
  console.log(`   👑 Admin: ${categorizedMissing.admin.length} missing`);
  console.log(`   📊 Dashboard: ${categorizedMissing.dashboard.length} missing`);
  console.log(`   📈 Analytics: ${categorizedMissing.analytics.length} missing`);
  console.log(`   🔍 Monitoring: ${categorizedMissing.monitoring.length} missing`);
  console.log(`   👥 Users: ${categorizedMissing.users.length} missing`);
  console.log(`   🔧 API: ${categorizedMissing.api.length} missing`);
  console.log(`   🔧 Other: ${categorizedMissing.other.length} missing`);
  
  if (missingEndpoints.length > 0) {
    console.log('\n❌ TOP MISSING ENDPOINTS:');
    missingEndpoints.slice(0, 30).forEach((endpoint, index) => {
      console.log(`   ${index + 1}. ${endpoint}`);
    });
    
    if (missingEndpoints.length > 30) {
      console.log(`   ... and ${missingEndpoints.length - 30} more`);
    }
  }
  
  console.log('\n✅ Results saved to: final-endpoint-comparison.json');
  
  return results;
}

// Run the comparison
if (require.main === module) {
  compareEndpoints();
}

module.exports = { compareEndpoints };
