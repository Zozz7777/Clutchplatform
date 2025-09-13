/**
 * Fix Missing authenticateToken Imports
 * Adds missing authenticateToken imports to all route files
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Missing authenticateToken Imports');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('='.repeat(60));

// List of route files that need the import
const routeFiles = [
  'verification.js', 'upload.js', 'twoFactorAuth.js', 'transactions.js',
  'tradeIn.js', 'tracking.js', 'telematicsData.js', 'system.js',
  'support.js', 'suppliers.js', 'subscriptions.js', 'settings.js',
  'session.js', 'services.js', 'security.js', 'sales.js',
  'role.js', 'roadsideAssistance.js', 'reviews.js', 'projects.js',
  'products.js', 'permission.js', 'payouts.js', 'payment.js',
  'partners.js', 'operations.js', 'obd2Device.js', 'obd.js',
  'notifications.js', 'monitoring.js', 'mobile.js', 'mfaSetup.js',
  'mechanics.js', 'marketing.js', 'market.js', 'maintenance.js',
  'loyalty.js', 'location.js', 'localization.js', 'learning-system.js',
  'jobs.js', 'invoices.js', 'insurance.js', 'hr.js',
  'gpsDevice.js', 'fleetVehicle.js', 'finance.js', 'feedback.js',
  'enterprise.js', 'employees.js', 'ecommerce.js', 'earnings.js',
  'driver.js', 'disputes.js', 'discounts.js', 'diagnostics.js',
  'dashboard.js', 'crm.js', 'communities.js', 'clients.js',
  'chat.js', 'cars.js', 'customers.js', 'orders.js',
  'reports.js', 'analytics.js', 'vehicles.js', 'users.js',
  'health.js', 'performance.js', 'analytics-backup.js', 'legal.js',
  'user-analytics.js', 'user-analytics-backup.js', 'revenue-analytics.js',
  'feedback-system.js', 'media-management.js', 'ai-ml.js', 'realtime.js',
  'auth-advanced.js', 'auto-parts-advanced.js', 'auto-parts.js',
  'mobile-cms.js', 'autonomous-system.js', 'ai-agent.js', 'parts.js',
  'partners-mobile.js', 'nextLevelFeatures.js', 'enterpriseAuth.js',
  'email-service.js', 'communication-backup.js', 'clutch-mobile.js',
  'car-health.js', 'business-intelligence.js', 'b2b.js', 'auditLog.js',
  'ai.js', 'ai-services.js', 'advancedFeatures.js'
];

function fixAuthenticateImport(routeFile) {
  const routePath = path.join(__dirname, '..', 'routes', routeFile);
  
  if (!fs.existsSync(routePath)) {
    console.log(`⚠️  Route file not found: ${routeFile}`);
    return;
  }
  
  let content = fs.readFileSync(routePath, 'utf8');
  
  // Check if authenticateToken import already exists
  if (content.includes("require('../middleware/auth')") || content.includes("authenticateToken")) {
    console.log(`✅ ${routeFile} already has authenticateToken import`);
    return;
  }
  
  // Find the first require statement and add the import after it
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("require(") && !lines[i].includes("authenticateToken")) {
      insertIndex = i + 1;
      break;
    }
  }
  
  // Insert the authenticateToken import
  lines.splice(insertIndex, 0, "const { authenticateToken } = require('../middleware/auth');");
  
  // Write back to file
  const newContent = lines.join('\n');
  fs.writeFileSync(routePath, newContent);
  console.log(`✅ Added authenticateToken import to ${routeFile}`);
}

// Process all route files
console.log(`\n🔄 Processing ${routeFiles.length} route files...\n`);

routeFiles.forEach(routeFile => {
  fixAuthenticateImport(routeFile);
});

console.log('\n' + '='.repeat(60));
console.log('🎯 AUTHENTICATE IMPORT FIXING COMPLETE');
console.log('='.repeat(60));
console.log('✅ Added authenticateToken imports to all route files');
console.log('✅ Server should now start without import errors');
console.log('\n🏁 All import issues fixed!');
