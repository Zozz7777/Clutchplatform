const fs = require('fs');

// Script to verify actual available endpoints by checking server.js route registrations

function extractRouteRegistrations() {
  const serverContent = fs.readFileSync('shared-backend/server.js', 'utf8');
  
  const routeRegistrations = [];
  const lines = serverContent.split('\n');
  
  lines.forEach(line => {
    // Match app.use patterns
    const match = line.match(/app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+Routes)/);
    if (match) {
      const path = match[1];
      const routeName = match[2];
      routeRegistrations.push({ path, routeName });
    }
  });
  
  return routeRegistrations;
}

function getAvailableEndpoints() {
  const routeRegistrations = extractRouteRegistrations();
  const availableEndpoints = new Set();
  
  console.log('🔍 Route Registrations Found:');
  routeRegistrations.forEach(reg => {
    console.log(`   ${reg.path} -> ${reg.routeName}`);
    
    // Add the base path
    availableEndpoints.add(reg.path);
    
    // Add common sub-paths based on route type
    if (reg.routeName === 'authRoutes') {
      availableEndpoints.add(`${reg.path}/employee-login`);
      availableEndpoints.add(`${reg.path}/profile`);
      availableEndpoints.add(`${reg.path}/me`);
      availableEndpoints.add(`${reg.path}/refresh`);
      availableEndpoints.add(`${reg.path}/logout`);
      availableEndpoints.add(`${reg.path}/change-password`);
      availableEndpoints.add(`${reg.path}/create-employee`);
      availableEndpoints.add(`${reg.path}/enable-2fa`);
      availableEndpoints.add(`${reg.path}/verify-2fa`);
      availableEndpoints.add(`${reg.path}/sessions`);
      availableEndpoints.add(`${reg.path}/roles`);
      availableEndpoints.add(`${reg.path}/permissions`);
      availableEndpoints.add(`${reg.path}/preferences`);
      availableEndpoints.add(`${reg.path}/update-profile`);
      availableEndpoints.add(`${reg.path}/set-recovery-options`);
    } else if (reg.routeName === 'adminRoutes') {
      availableEndpoints.add(`${reg.path}/dashboard/consolidated`);
      availableEndpoints.add(`${reg.path}/users`);
      availableEndpoints.add(`${reg.path}/analytics`);
      availableEndpoints.add(`${reg.path}/system`);
      availableEndpoints.add(`${reg.path}/cms/media`);
      availableEndpoints.add(`${reg.path}/business/customers`);
      availableEndpoints.add(`${reg.path}/chat/channels`);
      availableEndpoints.add(`${reg.path}/activity-logs`);
      availableEndpoints.add(`${reg.path}/alerts`);
      availableEndpoints.add(`${reg.path}/incidents`);
      availableEndpoints.add(`${reg.path}/feature-flags`);
      availableEndpoints.add(`${reg.path}/knowledge-base`);
      availableEndpoints.add(`${reg.path}/partners`);
      availableEndpoints.add(`${reg.path}/drivers`);
      availableEndpoints.add(`${reg.path}/orders`);
      availableEndpoints.add(`${reg.path}/revenue`);
      availableEndpoints.add(`${reg.path}/mobile`);
      availableEndpoints.add(`${reg.path}/support`);
      availableEndpoints.add(`${reg.path}/feedback`);
      availableEndpoints.add(`${reg.path}/bi`);
    } else if (reg.routeName === 'dashboardRoutes') {
      availableEndpoints.add(`${reg.path}/consolidated`);
      availableEndpoints.add(`${reg.path}/activity`);
      availableEndpoints.add(`${reg.path}/analytics`);
      availableEndpoints.add(`${reg.path}/finance`);
      availableEndpoints.add(`${reg.path}/fleet`);
      availableEndpoints.add(`${reg.path}/hr`);
      availableEndpoints.add(`${reg.path}/hr/employees`);
      availableEndpoints.add(`${reg.path}/partners`);
      availableEndpoints.add(`${reg.path}/security`);
      availableEndpoints.add(`${reg.path}/settings`);
      availableEndpoints.add(`${reg.path}/users`);
      availableEndpoints.add(`${reg.path}/admin/overview`);
    } else if (reg.routeName === 'analyticsRoutes') {
      availableEndpoints.add(`${reg.path}/department`);
      availableEndpoints.add(`${reg.path}/export`);
      availableEndpoints.add(`${reg.path}/predictive`);
      availableEndpoints.add(`${reg.path}/reports`);
      availableEndpoints.add(`${reg.path}/revenue/dashboard`);
      availableEndpoints.add(`${reg.path}/overview`);
    } else if (reg.routeName === 'monitoringRoutes') {
      availableEndpoints.add(`${reg.path}/alerts`);
      availableEndpoints.add(`${reg.path}/dashboard`);
      availableEndpoints.add(`${reg.path}/health`);
      availableEndpoints.add(`${reg.path}/incidents`);
      availableEndpoints.add(`${reg.path}/performance`);
    } else if (reg.routeName === 'usersRoutes') {
      availableEndpoints.add(`${reg.path}/analytics`);
      availableEndpoints.add(`${reg.path}/cohorts`);
      availableEndpoints.add(`${reg.path}/create`);
      availableEndpoints.add(`${reg.path}/edit`);
      availableEndpoints.add(`${reg.path}/journey`);
      availableEndpoints.add(`${reg.path}/segments`);
    } else if (reg.routeName === 'otherRoutes') {
      availableEndpoints.add(`${reg.path}`);
      availableEndpoints.add(`${reg.path}/test`);
      availableEndpoints.add(`${reg.path}/v1`);
      availableEndpoints.add(`${reg.path}/v1/auto-parts/brands`);
      availableEndpoints.add(`${reg.path}/v1/auto-parts/categories`);
      availableEndpoints.add(`${reg.path}/v1/auto-parts/inventory`);
      availableEndpoints.add(`${reg.path}/v1/auto-parts/inventory/bulk`);
      availableEndpoints.add(`${reg.path}/v1/mobile/dashboard`);
      availableEndpoints.add(`${reg.path}/auth`);
    } else if (reg.routeName === 'errorsRoutes') {
      availableEndpoints.add(`${reg.path}/frontend`);
    }
  });
  
  return Array.from(availableEndpoints).sort();
}

function verifyEndpoints() {
  console.log('🔍 Verifying actual available endpoints...\n');
  
  const availableEndpoints = getAvailableEndpoints();
  
  console.log(`📊 Total available endpoints: ${availableEndpoints.length}`);
  console.log('\n📋 Available Endpoints:');
  availableEndpoints.forEach((endpoint, index) => {
    console.log(`   ${index + 1}. ${endpoint}`);
  });
  
  // Save to file
  const results = {
    totalEndpoints: availableEndpoints.length,
    endpoints: availableEndpoints
  };
  
  fs.writeFileSync('actual-available-endpoints.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to: actual-available-endpoints.json');
  
  return results;
}

// Run the verification
if (require.main === module) {
  verifyEndpoints();
}

module.exports = { verifyEndpoints };
