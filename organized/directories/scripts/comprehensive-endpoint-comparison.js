const fs = require('fs');

// Comprehensive endpoint comparison script
// Compare 277 frontend API calls with backend endpoints

function loadBackendEndpoints() {
  try {
    const backendData = fs.readFileSync('backend-endpoints-audit.json', 'utf8');
    return JSON.parse(backendData);
  } catch (error) {
    console.log('❌ Could not load backend endpoints, using fallback...');
    return {
      allEndpoints: [
        // Authentication endpoints
        '/auth/employee-login', '/auth/profile', '/auth/update-profile', '/auth/preferences',
        '/auth/roles', '/auth/permissions', '/auth/sessions', '/auth/sessions/:id',
        '/auth/change-password', '/auth/create-employee', '/auth/enable-2fa', '/auth/verify-2fa',
        '/auth/set-recovery-options', '/auth/me', '/auth/refresh', '/auth/refresh-token',
        '/auth/current-user', '/auth/employee-me',
        
        // Admin endpoints (sample)
        '/admin/dashboard/consolidated', '/admin/users', '/admin/analytics', '/admin/system',
        '/admin/cms/media', '/admin/business/customers', '/admin/chat/channels',
        '/admin/activity-logs', '/admin/alerts', '/admin/incidents',
        
        // Dashboard endpoints
        '/dashboard/consolidated', '/dashboard/activity', '/dashboard/analytics',
        '/dashboard/finance', '/dashboard/fleet', '/dashboard/hr', '/dashboard/hr/employees',
        '/dashboard/partners', '/dashboard/security', '/dashboard/settings', '/dashboard/users',
        '/dashboard/admin/overview',
        
        // Analytics endpoints
        '/analytics/department', '/analytics/export', '/analytics/predictive',
        '/analytics/reports', '/analytics/revenue/dashboard', '/analytics/overview',
        '/users/analytics/dashboard',
        
        // Monitoring endpoints
        '/monitoring/alerts', '/monitoring/dashboard', '/monitoring/health',
        '/monitoring/incidents', '/monitoring/performance',
        
        // User endpoints
        '/users/analytics', '/users/cohorts', '/users/create', '/users/edit',
        '/users/journey', '/users/segments',
        
        // Other endpoints
        '/api', '/api/test', '/api/v1', '/api/v1/auto-parts/brands',
        '/api/v1/auto-parts/categories', '/api/v1/auto-parts/inventory',
        '/api/v1/auto-parts/inventory/bulk', '/api/v1/mobile/dashboard', '/auth',
        
        // Error endpoints
        '/errors/frontend'
      ]
    };
  }
}

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

function compareEndpoints() {
  console.log('🔍 Starting comprehensive endpoint comparison...\n');
  
  // Load frontend API calls
  const frontendData = JSON.parse(fs.readFileSync('comprehensive-frontend-audit.json', 'utf8'));
  const frontendCalls = frontendData.allApiCalls;
  
  // Load backend endpoints
  const backendData = loadBackendEndpoints();
  const backendEndpoints = backendData.allEndpoints || [];
  
  console.log(`📊 Frontend API calls found: ${frontendCalls.length}`);
  console.log(`📊 Backend endpoints available: ${backendEndpoints.length}`);
  
  // Normalize and categorize endpoints
  const normalizedFrontend = new Set();
  const normalizedBackend = new Set();
  
  frontendCalls.forEach(call => {
    const normalized = normalizeEndpoint(call);
    if (normalized && normalized.length > 1 && !normalized.includes('</code>') && !normalized.includes("'")) {
      normalizedFrontend.add(normalized);
    }
  });
  
  backendEndpoints.forEach(endpoint => {
    const normalized = normalizeEndpoint(endpoint);
    if (normalized && normalized.length > 1) {
      normalizedBackend.add(normalized);
    }
  });
  
  // Find missing endpoints
  const missingEndpoints = [];
  const availableEndpoints = [];
  
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
  fs.writeFileSync('comprehensive-endpoint-comparison.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 COMPREHENSIVE ENDPOINT COMPARISON RESULTS:');
  console.log('==========================================');
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
    missingEndpoints.slice(0, 20).forEach((endpoint, index) => {
      console.log(`   ${index + 1}. ${endpoint}`);
    });
    
    if (missingEndpoints.length > 20) {
      console.log(`   ... and ${missingEndpoints.length - 20} more`);
    }
  }
  
  console.log('\n✅ Results saved to: comprehensive-endpoint-comparison.json');
  
  return results;
}

// Run the comparison
if (require.main === module) {
  compareEndpoints();
}

module.exports = { compareEndpoints };
